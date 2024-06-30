import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import { createPinia } from "pinia";
import App from "@/App.vue";
import Events from "@/components/Events.vue";
import MaintainEvent from "@/components/MaintainEvent.vue";
import EventDetail from "@/components/EventDetail.vue";
import LoginPage from "@/components/LoginPage.vue";

const routes = [
  // {
  //   path: "/events",
  //   component: Events,
  // },
  {
    path: "/",
    component: Events,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  {
    path: "/event/:slug?",
    component: EventDetail,
  },
  {
    path: "/steam/callback",
    component: LoginPage,
  },
  {
    path: "/mnt-event/:slug?",
    component: MaintainEvent,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");
