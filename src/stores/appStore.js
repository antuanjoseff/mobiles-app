import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    tracking: true,
    position: {
      altitude: null,
      accuracy: null,
      longitude: null,
      latitude: null,
    },
  }),

  getters: {
    getTracking(state) {
      return state.tracking;
    },

    getPosition(state) {
      return state.position;
    },
  },

  actions: {
    setTracking(tracking) {
      console.log(tracking);
      this.tracking = tracking;
    },

    setPosition(position) {
      this.position = position;
    },
  },
});
