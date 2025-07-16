<script setup>
  import { ref } from 'vue';
  import modelsData from '@/models.json';

  const models = ref(modelsData);
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-2 w-full max-w-[700px]">
    <button class="px-4 py-2 bg-yellow-200 border border-yellow-300 rounded shadow-sm hover:bg-yellow-100">Version 1</button>
    <button class="px-4 py-2 bg-yellow-200 border border-yellow-300 rounded shadow-sm hover:bg-yellow-100">Version 2</button>
    <button class="px-4 py-2 bg-yellow-200 border border-yellow-300 rounded shadow-sm hover:bg-yellow-100">Version 3</button>
  </div>
</template>