<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return `layout/images/auto-park-for-${layoutConfig.darkTheme.value ? 'dark' : 'light'}.png`;
});
</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
    </div>
</template>
<style lang="scss" scoped></style>
