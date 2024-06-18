import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import App from "./App.vue";
import Event from "./components/Event.vue";
import MaintainEvent from "./components/MaintainEvent.vue";

const routes = [
  {
    path: "/event/:id?",
    component: Event,
  },
  {
    path: "/mnt-event/:id?",
    component: MaintainEvent,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router).mount("#app");
