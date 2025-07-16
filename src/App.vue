<script setup>
import Header from '@/components/Header.vue';
import Interface from '@/components/Interface.vue';
</script>

<template>
<body class="bg-yellow-50 text-gray-800 min-h-screen flex flex-col">

  <Header />

  <!-- Main Content -->
  <main class="flex flex-col md:flex-row p-6 gap-6 mt-8 flex-1 items-start justify-center">
    <!-- Left Section: 3D Viewer and Tabs -->
    <section class="flex-1 relative flex flex-col justify-center max-w-screen-md w-full">
      <!-- 3D Viewer Placeholder -->
      <div class="w-full aspect-[1/1] max-w-[700px] bg-yellow-200 border-yellow-200 rounded-lg flex items-center justify-center relative mx-auto">
        <span class="text-yellow-700">3D Viewer Placeholder</span>

        <!-- Tabs for Versions -->
        <div class="absolute -top-8 left-4 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-yellow-200 border border-yellow-200 rounded-t-md hover:bg-yellow-100">Version 1</button>
          <button class="px-4 py-2 bg-yellow-200 border border-yellow-200 rounded-t-md hover:bg-yellow-100">Version 2</button>
          <button class="px-4 py-2 bg-yellow-200 border border-yellow-200 rounded-t-md hover:bg-yellow-100">Version 3</button>
        </div>
      </div>
    </section>

    <!-- Right Section: Navigation Menu -->
    <aside class="w-full md:w-64 bg-yellow-100 border border-yellow-200 p-4 rounded-lg h-fit md:h-auto">
      <!-- Toggle Button -->
      <button class="w-full mb-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600">Toggle Floorplan / 3D</button>

      <!-- Room Navigation List -->
      <nav>
        <h2 class="text-lg font-semibold mb-2">Rooms</h2>
        <ul class="space-y-2">
          <li><button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">Living Room</button></li>
          <li><button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">Kitchen</button></li>
          <li><button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">Bedroom 1</button></li>
          <li><button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">Bedroom 2</button></li>
          <li><button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">Bathroom</button></li>
        </ul>
      </nav>
    </aside>
  </main>
</body>
</template>