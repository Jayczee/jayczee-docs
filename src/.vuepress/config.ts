import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import {componentsPlugin} from "vuepress-plugin-components";

export default defineUserConfig({
  base: "/",

  locales: {
    "/en/": {
      lang: "en-US",
      title: "Jayczee Notes Everything",
      description: "Hope you can find what you want here.",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "啥玩意都记啊",
      description: "寻你所需，皆可在此。",
    },
  },
  head:[
    ['script', { rel: 'text/javascript', href: '/src/.vuepress/public/js/swf2js.js' }]
  ],
  theme

});
