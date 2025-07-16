<script setup>
  import { ref } from 'vue';
  import modelsData from '@/models.json';

  const models = ref(modelsData);
</script>

<template>
  <div class="w-fit h-fit">
    <span class="m-0.5 pl-1 pr-1 text-2xl border-2" v-for="model in models" :key="model.index">{{ model.name }}</span>
  </div>
</template>