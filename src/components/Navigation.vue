<script setup>
    const rooms = ['Room 1', 'Room 2', 'Room 3'];
</script>

<template>
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
</template>