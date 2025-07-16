import { defineStore } from 'pinia';

export const useViewerStore = defineStore('viewer', {
  state: () => ({
    // View can either be 3D or Floorplan
    view: "3D",
  }),
  actions: {
    toggleView() {
        this.view = this.view === "3D" ? "Floorplan" : "3D";
    },
  },
})