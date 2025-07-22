<script setup>
import { useViewerStore } from '@/store/store.js';
import { computed } from 'vue';

const viewerStore = useViewerStore();
const rooms = computed(() => viewerStore.getRooms());

function handleHover(room) {
  viewerStore.highlightRoom(room.id);
}
function handleLeave() {
  viewerStore.clearHighlight();
}
</script>

<template>
  <nav>
    <h2 class="text-lg font-semibold mb-2">Room Navigation</h2>
    <ul class="space-y-2">
      <li v-for="room in rooms" :key="room.id">
        <button
          class="w-full text-sm text-left px-3 py-2 rounded hover:bg-yellow-200"
          @mouseenter="handleHover(room)"
          @mouseleave="handleLeave"
        >
          {{ room.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>