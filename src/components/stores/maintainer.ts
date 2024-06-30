import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

const userJWT = useStorage("userJWT", "");
export interface Maintainer {
  avatarfull: string;
  steamid: string;
  personaname: string;
  loccountrycode: string;
}
export const userUserStore = defineStore("user", () => {
  const maintainer = computed(() => {
    if (!userJWT.value)
      return null;

    const b64Data = userJWT.value.split(".")[1];
    const userData = JSON.parse(atob(b64Data));
    return userData.payload as Maintainer;
  });
  function setJWT(token: string) {
    userJWT.value = token;
  }
  return {
    maintainer,
    defaultAvatar: "https://vip2.loli.io/2022/10/04/k5NG4zLcdRZmTM6.png",
    setJWT,
    loggedIn: !!maintainer,
  };
});
