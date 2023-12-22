<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import DarkImageLogo from '@/assets/images/auto-park-for-dark.png';
import LightImageLogo from '@/assets/images/auto-park-for-light.png';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return layoutConfig.darkTheme.value ? DarkImageLogo : LightImageLogo;
});
</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
    </div>
</template>
<style lang="scss" scoped></style>
