/*! *****************************************************************************
Copyright (c) taoyongwen. All rights reserved.

底部  导航标签
***************************************************************************** */
import { getNavBar, renderNavTrees } from "../../render/pageNav";
import { setNavItems, getProjectTitleJson, getProjectNavJson, getCurPageContent, getCurViewContent } from "../../render/workbench";
import { getNavItems } from "../../render/workbench";
import { IPanel } from "../../common/interfaceDefine";
import * as form from "../../render/form";
import * as forms from "../../render/forms";
import { ipcRendererSend } from "../../preload";
import { getTitleBar } from "../../render/pageTitle";
var editor: any;
var editorComponent: any;
var editorChange: boolean = false;
const panel: IPanel = {
    key: "nav", name: "导航", hidden: true,sort:0,
    render: (content: HTMLElement) => {
        var row = document.createElement("div");
        row.style.display = "flex";
        row.style.height = "100%";
        content.appendChild(row);


        var nav = document.createElement("div");
        nav.id = "navEditor";
        nav.style.height = "100%";
        nav.style.flex = "1";
        nav.style.minHeight = "100px";
        row.appendChild(nav);
        //

        var panel = document.createElement("div");
        panel.id = 'navPanel';
        panel.style.flex = "1";
        row.appendChild(panel);

        const ace = require("ace-builds/src/ace.js");
        require("ace-builds/src/mode-json.js");
        require("ace-builds/src/ext-language_tools.js");
        require("ace-builds/src/theme-tomorrow_night.js");
        require("ace-builds/src/theme-tomorrow.js");
        
        editor = ace.edit(nav);
        editor.setOption({
            // 默认:false
            model: "ace/mode/json",
            wrap: true, // 换行
            autoScrollEditorIntoView: false, // 自动滚动编辑器视图
            enableLiveAutocompletion: true, // 智能补全
            enableBasicAutocompletion: true, // 启用基本完成 不推荐使用
            showPrintMargin: false
        });
        
        if (document.getElementById("app").className == "dark")
            editor.setTheme("ace/theme/tomorrow_night");
        else
            editor.setTheme("ace/theme/tomorrow");

        editor.getSession().on('change', (e: any) => {
            var lines = editor.getSession().doc.$lines;
            var code = "";
            lines.forEach((line: any) => {
                code += line + "\n";
            })
            // console.log("nav change ",code);
            var pageC=getCurViewContent();
            var bars=pageC.getElementsByClassName("nav_bar");
            // console.log(bars);
            var nav_bar:any= bars[0];
            if (nav_bar != undefined && editorChange) {
                try {
                    var navJson = eval(code);//JSON.parse(code);
                    setNavItems(navJson);
                    renderNavTrees(nav_bar, navJson);
                    ipcRendererSend("saveNav", JSON.stringify(getNavBar()));
                } catch (ec) {
                    console.log(ec);
                }
            }

        });
    }, 
    update: () => {      
        var nav = getNavItems();
        // console.log(JSON.stringify(nav, null, 4));
        editor.setValue(JSON.stringify(nav, null, 4));
        editor.gotoLine(0);
        editor.resize();
        editorChange = true;


        console.log("navPanel");
        var navPanel = document.getElementById("navPanel");
        navPanel.innerHTML = "";
        console.log("navPanel", navPanel);
        if (navPanel == undefined || navPanel == null) return;
        navPanel.style.padding = "0px 20px 0px 20px";

        var row = document.createElement("div");
        row.style.display = "flex";
        navPanel.appendChild(row);

        var title = document.createElement("div");
        title.style.flex = "1";
        row.appendChild(title);

        var space = document.createElement("div");
        space.style.minWidth = "20px";
        row.appendChild(space);

        var navdiv = document.createElement("div");
        navdiv.style.flex = "1";
        row.appendChild(navdiv);

        var titleJson = getProjectTitleJson();
        var navJson = getProjectNavJson();
        console.log(titleJson);

        if (titleJson == undefined || navJson == undefined) {
            console.log("titleJson==undefined||navJson==undefined");
            return;
        }

        form.createDivCheck(title, "显示标题栏", titleJson.display, (value) => {

            titleJson.display = value;
            var titles =getCurViewContent().getElementsByClassName("title_bar");
            if(titles.length>0){
                var titlebar:any=titles[0];
                if (value) {
                    titlebar.style.display = "block";
                } else {
                    titlebar.style.display = "none";
                }
            }
            ipcRendererSend("saveTitle", JSON.stringify(getTitleBar()));
        
          

        });

        var titlebg= new forms.FormColor("标题背景色");
        titlebg.render(title);
        titlebg.update(titleJson.background,(color)=>{
            var titles =getCurViewContent().getElementsByClassName("title_bar");
            if(titles.length>0){
                var titlebar:any=titles[0];
                titlebar.style.backgroundColor = color;
            }
            titleJson.background = color;
            ipcRendererSend("saveTitle", JSON.stringify(getTitleBar()));
        });
        // form.createDivInput(title, "标题背景色", titleJson.background, (color) => {
        //     var title = document.getElementById("title_bar");
        //     title.style.backgroundColor = color;
        //     titleJson.background = color;
        // });

        form.createDivCheck(navdiv, "显示导航", navJson.display, (value) => {
            navJson.display = value;
            var navbars = getCurViewContent().getElementsByClassName("nav_bar");
            if (navbars.length > 0) {
                var navbar:any = navbars[0];
                if (value) {
                    navbar.style.display = "block";
                } else {
                    navbar.style.display = "none";
                }
            }
           
            ipcRendererSend("saveNav", JSON.stringify(getNavBar()));

        });



        // form.createDivInput(navdiv, "导航背景色", navJson.background, (color) => {
        //     var title = document.getElementById("nav_bar");
        //     title.style.backgroundColor = color;
        //     navJson.background = color;
        // });

        var navbg= new forms.FormColor("导航背景色");
        navbg.render(navdiv);
        navbg.update(navJson.background,(color)=>{
            var navbars = getCurViewContent().getElementsByClassName("nav_bar");
            if (navbars.length > 0) {
                var navbar:any= navbars[0];
                navbar.style.backgroundColor = color;
            }
        
            navJson.background = color;
            ipcRendererSend("saveNav", JSON.stringify(getNavBar()));
        });
    }

}
export default function load() {
    return panel;
}

