---
index: true
title: 在末flash时代寻找加载flash游戏的方法
order: 1
---
# 在末flash时代寻找加载flash游戏的方法

## 引言

&ensp;&ensp;&ensp;&ensp;在我幼儿园刚刚接触电脑的时候，就沉迷于各种flash小游戏无法自拔。各种耳熟能详小游戏网站例如`7k7k`与`4399`。  
&ensp;&ensp;&ensp;&ensp;好景不长，**Adobe宣布停止对flash的支持**。各大浏览器产商也纷纷宣布停止对flash的支持。甚至连Windows系统也发布了更新补丁删除了系统中的flash组件。
现在再去浏览这些网站，大多数的flash游戏都已经**无法正常运行**了。需要用户单独下载包含flash插件的浏览器才能正常运行。  
&ensp;&ensp;&ensp;&ensp;起初，我准备在文档中嵌入一些flash游戏，但是发现这些游戏都无法正常运行。于是我开始寻找一些可以正常运行flash游戏的方法。除去个人感觉最繁琐且最不优雅的更换浏览器的方法之外，我搜索到了如下几种解决方案：
- 使用浏览器拓展，例如`Ruffle`
- 页面内嵌支持flash的播放器

&ensp;&ensp;&ensp;&ensp;一开始我也懒得折腾，直接打算选择`浏览器拓展`这条路。但经过实测，浏览器拓展的效果并不理想。它对大部分flash动画能够做到比较好的支持，但是对于flash游戏的支持并不理想。大部分flash游戏在页面仍然显示**Adobe Flash已不再受到支持**等字样。  

&ensp;&ensp;&ensp;&ensp;更何况，说不定哪天有其他人看了自己的文档，总不能在人家想要体验文档中的flash游戏的时候，让人家去下载浏览器拓展吧。:cold_sweat::cold_sweat:

&ensp;&ensp;&ensp;&ensp;没办法，只能投入第二种方案的坑中。

## 页面嵌入播放器

### [swf2js](https://github.com/swf2js/swf2js)
&ensp;&ensp;&ensp;&ensp;来自霓虹国的神秘科技。提供免费版和商业版。主要是研究了好一阵子也没有看明白示例，***是直接渲染整个页面？***。感兴趣的可以研究一下。

### Cheerpx For Flash
&ensp;&ensp;&ensp;&ensp;仍然在开发中的项目。目前(2023-09-21)仍然可以到官网发送邮件申请测试。流程过长，放弃折腾。但据体验过的用户评价，可能是效果最好的一款网页内嵌flash播放器。

### [AwayFl Player embed](https://github.com/awayfl/away-player-embed)
&ensp;&ensp;&ensp;&ensp;这是我上手测试过的一款内嵌播放器。在官方网站上传了一个swf游戏进行测试，测试效果特别糊。但这似乎是内嵌播放器的通病。不同的播放器都存在不同程度的糊的问题。
### [Ruffle](https://github.com/ruffle-rs/ruffle)
&ensp;&ensp;&ensp;&ensp;Ruffle is an Adobe Flash Player emulator written in the Rust programming language. Ruffle targets both the desktop and the web using WebAssembly.  
&ensp;&ensp;&ensp;&ensp;没错，仍旧是Ruffle。以上这段文字引用于[Ruffle官方Github](https://github.com/ruffle-rs/ruffle)。事实上，Ruffle支持多种方式帮助用户浏览flash。包括但不限于**浏览器拓展**、**页面嵌入播放器**等多种方式。这个模块的文档就采用了页面嵌入播放器的方式实现了无需客户端支持的在线游玩flash游戏。

## 使用Ruffle将游戏嵌入网站
[雷巴的冒险2.9汉化版](./games/Leba2_9.md)  

&ensp;&ensp;&ensp;&ensp;用上面的文章作为例子。这个文档是使用Vuepress Theme Hope写的，其本质仍然是一个Markdown。虽然MarkDown文档可以嵌入HTML代码，但也只有部分受到支持。至少没法直接在md中写script`虽然没报错但是一直没有生效`。  
&ensp;&ensp;&ensp;&ensp;我当前的解决方式是写一个***html页面，在html中实现嵌入，然后在Markdown中使用iframe标签将其引入***。  

-----------------
html页面代码如下：
```html
<html>
    <body>
    <div id="container" style="width: 800px;height: 600px;display: flex;justify-content: center"></div>
        <script>
            window.RufflePlayer = window.RufflePlayer || {};
            window.addEventListener("load", (event) => {
                const ruffle = window.RufflePlayer.newest();
                const player = ruffle.createPlayer();
                player.config = {
                    quality:"best",
                    preferredRenderer: "canvas"
                };
                player.metadata = {
                    width:800,
                    height:600
                };
                const container = document.getElementById("container");
                container.appendChild(player);
                player.load({
                    url: "swf文件地址"
                });
            });
        </script>
        <script src="/js/ruffle/ruffle.js"></script>
    </body>
    <style>
        ruffle-player{
            width: 800px;
            height: 600px;
        }
    </style>
</html>
```
ruffle-player可以在页面上任意一个div中嵌入，其他几个项目似乎也能做到这一点（至少swf2js）我是真没发现怎么用...