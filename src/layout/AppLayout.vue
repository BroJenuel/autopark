<script setup>
import { computed, watch, ref, onBeforeMount } from 'vue';
import AppTopbar from './AppTopbar.vue';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppConfig from './AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';
import { isSignedIn } from '@/service/supabase/supabase';
import { useRouter } from 'vue-router';
import { useUserStore } from "@/store/userStore";
import DriverWarningDialog from "@/components/DialogWarnings/DriverWarningDialog.vue";

const DriverWarningDialogRef = ref(null);
const AppConfigRef = ref()
const router = useRouter();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref(null);
const userStore = useUserStore();

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

const containerClass = computed(() => {
    return {
        'layout-theme-light': layoutConfig.darkTheme.value === 'light',
        'layout-theme-dark': layoutConfig.darkTheme.value === 'dark',
        'layout-overlay': layoutConfig.menuMode.value === 'overlay',
        'layout-static': layoutConfig.menuMode.value === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive.value,
        'layout-mobile-active': layoutState.staticMenuMobileActive.value,
        'p-input-filled': layoutConfig.inputStyle.value === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple.value
    };
});
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

onBeforeMount(async () => {
    if(!(await isSignedIn())) await router.push('/auth/login');

    if (userStore.role === 'driver') {
        DriverWarningDialogRef.value.showDialog();
    }
})
</script>

<template>
    <DriverWarningDialog ref="DriverWarningDialogRef" />
    <div class="layout-wrapper" :class="containerClass">
        <AppTopbar @changeTheme="AppConfigRef.toggleThemeConfig()"></AppTopbar>
        <div class="layout-sidebar">
            <AppSidebar></AppSidebar>
        </div>
        <div class="layout-main-container">
            <div class="layout-main">
                <RouterView></RouterView>
            </div>
            <AppFooter></AppFooter>
        </div>
        <AppConfig ref="AppConfigRef"></AppConfig>
        <div class="layout-mask"></div>
    </div>
</template>

<style lang="scss" scoped></style>
