import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    position: {
      altitude: null,
      accuracy: null,
      longitude: null,
      latitude: null,
    },
  }),

  getters: {
    getPosition(state) {
      return state.position;
    },
  },

  actions: {
    setPosition(position) {
      this.position = position;
    },
  },
});
