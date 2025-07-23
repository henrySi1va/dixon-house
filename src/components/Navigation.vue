<script setup>
import { useViewerStore } from '@/store/store.js';
import { computed } from 'vue';

const viewerStore = useViewerStore();
const rooms = computed(() => viewerStore.getRooms());
const selectedRoom = computed(() => viewerStore.selectedRoom);

function handleHover(room) {
  viewerStore.highlightRoom(room.id);
}
function handleLeave() {
  viewerStore.clearHighlight();
}
function handleClick(room) {
  viewerStore.setSelectedRoom(room.id);
}
function handleReset() {
  viewerStore.clearSelectedRoom();
}
</script>

<template>
  <nav>
    <div class="flex items-center mb-2">
      <h2 class="text-lg font-semibold">Room Navigation</h2>
      <button
        v-if="selectedRoom"
        @click="handleReset"
        class="ml-2 rounded text-white hover:bg-yellow-200 transition-colors duration-150 flex items-center justify-center"
        aria-label="Reset camera"
        style="height: 2.25rem; width: 2.25rem; font-size: 1.25rem;"
      >🔙</button>
    </div>
    <ul class="space-y-2">
      <li v-for="room in rooms" :key="room.id">
        <button
          class="w-full text-sm text-left px-3 py-2 rounded hover:bg-yellow-200"
          @mouseenter="handleHover(room)"
          @mouseleave="handleLeave"
          @click="handleClick(room)"
        >
          {{ room.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>