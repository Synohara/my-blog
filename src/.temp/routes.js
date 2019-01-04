import NotFound from "/Users/shinoharamakoto/my-blog/node_modules/gridsome/app/pages/404.vue"

export const routes = [
  {
    name: "home",
    path: "/",
    component: () => import(/* webpackChunkName: "component--home" */ "~/pages/Index.vue"),
    meta: { data: true }
  }
]

export { NotFound }

