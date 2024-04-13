<script setup>
import { ref } from "vue";

const visible = ref(false);

function showDialog() {
    visible.value = true;
}

defineExpose({
    showDialog
});

</script>

<template>
    <Dialog v-model:visible="visible" :style="{ width: '50rem', margin:'20px' }" header="Warning" modal>
        <div style="text-align: center">
            <div class="mb-3" style="color: red; font-weight: bold; font-size: 2.5rem">
                WARNING
            </div>
            <div class="flex justify-content-end gap-2 text-2xl">
                Attention drivers: Please refrain from using the app while driving. Safety first! Thank you for your
                cooperation.
            </div>
        </div>
    </Dialog>
</template>