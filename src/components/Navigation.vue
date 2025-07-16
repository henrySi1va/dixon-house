<script setup>
    const rooms = ['Room 1', 'Room 2', 'Room 3'];
</script>

<template>
    <nav>
        <h2 class="text-lg font-semibold mb-2">Room Navigation</h2>
        <ul class="space-y-2">
            <li v-for="room in rooms" :key="room">
                <button class="w-full text-left px-3 py-2 rounded hover:bg-yellow-200">
                    {{ room }}
                </button>
            </li>
        </ul>
    </nav>
</template>