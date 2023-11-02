import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/en/": [
      {
          text: "Flash Games",
          icon: "laptop-code",
          prefix: "flash/",
          children: "structure",
          collapsible: true
      },
      {
          text: "Spring",
          icon: "/assets/icon/spring.png",
          prefix: "spring/",
          children: "structure",
          collapsible: true
      },
  ],
});
