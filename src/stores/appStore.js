import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    msg: "",
    tracking: true,
    position: {
      altitude: null,
      accuracy: null,
      longitude: null,
      latitude: null,
    },
  }),

  getters: {
    getMsg(state) {
      return state.msg;
    },

    getTracking(state) {
      return state.tracking;
    },

    getPosition(state) {
      return state.position;
    },
  },

  actions: {
    setMsg(msg) {
      this.msg = msg;
    },

    setTracking(tracking) {
      console.log(tracking);
      this.tracking = tracking;
    },

    setPosition(position) {
      this.position = position;
    },
  },
});
