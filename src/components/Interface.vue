<script setup>
import Selector from '@/components/Selector.vue';
import Viewer from '@/components/Viewer.vue';
import Navigation from '@/components/Navigation.vue';
import { useViewerStore } from '@/store/store.js';

const viewerStore = useViewerStore();
</script>

<template>
  <main class="flex flex-col md:flex-row p-6 gap-6 flex-1 items-start justify-center">
    <!-- Left Section: Tabs and 3D Viewer -->
    <section class="flex-1 flex flex-col max-w-screen-md w-full items-center">
      <!-- <Selector /> -->
      <Viewer />
    </section>

    <!-- Right Section: Navigation Menu -->
    <aside class="w-full md:w-64 bg-yellow-100 border border-yellow-200 p-4 rounded-lg h-fit md:h-auto md:self-start md:mt-[3rem]">
      <!-- Toggle Button -->
      <button
        class="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="viewerStore.toggleView"
      >
        Switch to {{ viewerStore.view === "3D" ? "Floorplan" : "3D" }} View
      </button>
      <!-- <Navigation/> -->
    </aside>
  </main>
</template>