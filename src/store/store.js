import { defineStore } from 'pinia';

export const useViewerStore = defineStore('viewer', {
  state: () => ({
    // View can either be 3D or Floorplan
    view: "3D",
    rooms: [],
    highlightedRoomId: null,
    selectedRoom: null,
  }),
  actions: {
    toggleView() {
      this.view = this.view === "3D" ? "Floorplan" : "3D";
    },
    addRoom(room) {
      this.rooms.push(room);
    },
    setRooms(roomList) {
      this.rooms = roomList;
    },
    clearRooms() {
      this.rooms = [];
      this.highlightedRoomId = null;
    },
    getRooms() {
      return this.rooms;
    },
    highlightRoom(roomId) {
      this.highlightedRoomId = roomId;
    },
    clearHighlight() {
      this.highlightedRoomId = null;
    },
    setSelectedRoom(roomId) { this.selectedRoom = roomId; },
    clearSelectedRoom() { this.selectedRoom = null; },
  },
});