<script setup>
import Selector from '@/components/Selector.vue';
import Viewer from '@/components/Viewer.vue';
import Navigation from '@/components/Navigation.vue';
</script>

<template>
  <div class="flex flex-col items-center w-full h-full min-h-screen">
    <!-- Tabs/Selector above and flush left with viewer -->
    <div class="flex w-full max-w-5xl mt-8">
      <div class="flex flex-col w-full">
        <div class="flex">
          <Selector />
        </div>
        <div class="flex flex-col md:flex-row w-full">
          <!-- Viewer -->
          <div class="flex-1 flex justify-center items-start">
            <Viewer />
          </div>
          <!-- Navigation: right on desktop, below on mobile -->
          <div class="md:ml-8 md:w-64 w-full mt-4 md:mt-0 flex-shrink-0 flex justify-center">
            <Navigation />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>