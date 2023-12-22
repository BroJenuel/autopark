<script setup>
import { ref } from 'vue';

const showModal = ref(false)
function toggleModal() {
    showModal.value = !showModal.value
}

defineExpose({
    toggleModal
})
</script>

<template>
    <Dialog v-model:visible="showModal" modal header="Header" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
    </Dialog>
</template>

<style scoped lang="scss">

</style>