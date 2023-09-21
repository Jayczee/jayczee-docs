---
index: true
title: Finding Ways to Load Flash Games
order: 1
---
# Finding Ways to Load Flash Games

## Introduction

&ensp;&ensp;&ensp;&ensp;When I first came into contact with computers in kindergarten, I was addicted to various flash games. Well-known game websites such as`7k7k`and`4399`were my favorites.  
&ensp;&ensp;&ensp;&ensp;Unfortunately, **Adobe announced the end of support for Flash**. Major browser manufacturers also announced the end of support for Flash. Even Windows system has released an update patch to remove the Flash components in the system. Now when you visit these websites, most of the flash games cannot run normally. Users need to download a browser with a Flash plugin to run them normally.  
&ensp;&ensp;&ensp;&ensp;At first, I planned to embed some flash games in the document, but found that these games could not run normally. So I started looking for some ways to run flash games normally. In addition to the most cumbersome and least elegant method of changing browsers, I found the following solutions:
- Use browser extensions, such as `Ruffle`
- Embed a Flash-supporting player in the page

&ensp;&ensp;&ensp;&ensp;I was too lazy to bother, and directly chose the `browser extension` route. But after testing, the effect of the browser extension is not ideal. It can support most flash animations quite well, but it is not ideal for flash games. Most flash games on the page still show ***Adobe Flash is no longer supported*** and other words.  

&ensp;&ensp;&ensp;&ensp;Moreover, maybe one day someone else reads their own documents, and they can’t let others download browser extensions when they want to experience the flash games in the documents. :cold_sweat::cold_sweat:

&ensp;&ensp;&ensp;&ensp;There is no way, I can only fall into the pit of the second solution.

## Embedding Player in Page

### [swf2js](https://github.com/swf2js/swf2js)
&ensp;&ensp;&ensp;&ensp;Mysterious technology from Neon Country. It offers a free version and a commercial version. The main thing is that I studied it for a long time and didn’t understand the example, ***is it directly rendering the entire page?***. If you are interested, you can study it.

### Cheerpx For Flash
&ensp;&ensp;&ensp;&ensp;A project still under development. So far (2023-09-21), you can still go to the official website to send an email to apply for testing. The process is too long, so I gave up. But according to users who have experienced it, it may be the best web-embedded flash player.

### [AwayFl Player embed](https://github.com/awayfl/away-player-embed)
&ensp;&ensp;&ensp;&ensp;This is an embedded player I have tested. I uploaded a swf game for testing on the official website, and the test effect was particularly blurry. But this seems to be a common problem with embedded players. Different players have different degrees of blurring problems.
### [Ruffle](https://github.com/ruffle-rs/ruffle)
&ensp;&ensp;&ensp;&ensp;Ruffle is an Adobe Flash Player emulator written in the Rust programming language. Ruffle targets both the desktop and the web using WebAssembly.  
&ensp;&ensp;&ensp;&ensp;Yes, it’s still Ruffle. The above text is quoted from [Ruffle’s official Github](https://github.com/ruffle-rs/ruffle). In fact, Ruffle supports multiple ways to help users browse flash. Including but not limited to browser extensions, page embedded players and other ways. This module’s document uses the method of embedding the player in the page to achieve online flash game play **without client support**.

## Using Ruffle to Embed Games on Websites
[Leba’s Adventure 2.9 Chinese Version](./games/Leba2_9.md)  

&ensp;&ensp;&ensp;&ensp;Take the above article as an example. This document is written using Vuepress Theme Hope, which is essentially a Markdown. Although MarkDown documents can embed HTML code, only some are supported. At least you can’t directly write script in md `although there is no error, it has not been effective`.  
&ensp;&ensp;&ensp;&ensp;My current solution is to ***write an html page, implement embedding in html, and then use the iframe tag to introduce it in Markdown***.  

-----------------
The code for the html page is as follows:
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
                    url: "swf file url"
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
ruffle-player can be embedded in any div on the page, and other projects seem to be able to do this.About swf2js...I really didn’t find out how to use it...