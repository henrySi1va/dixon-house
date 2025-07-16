<script setup>
  import { ref } from 'vue';
  import modelsData from '@/models.json';

  const models = ref(modelsData);
</script>

<template>
  <div class="flex flex-wrap gap-2 mb-2 w-full max-w-[700px]">
    <button v-for="model in models" :key="model.id"
            class="px-4 py-2 min-w-24 bg-yellow-200 border
            border-yellow-300 rounded shadow-sm hover:bg-yellow-100">
            {{ model.name }}</button>
  </div>
</template>