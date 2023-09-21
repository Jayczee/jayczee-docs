import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/zh/": [
    {
      text: "Flash小游戏",
      icon: "laptop-code",
      prefix: "flash/",
      children: "structure",
    },
    // {
    //   text: "文档",
    //   icon: "book",
    //   prefix: "guide/",
    //   children: "structure",
    // },
    // "slides",
  ],
});
