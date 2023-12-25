<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signOutUser } from '@/service/supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { Loading } from 'notiflix';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const router = useRouter();
const menu = ref();
const accountLabel = computed(() => {
    const first_name = userStore.session && userStore.session.user && userStore.session.user.user_metadata && userStore.session.user.user_metadata.first_name ? userStore.session.user.user_metadata.first_name : 'Profile';
    const last_name = userStore.session && userStore.session.user && userStore.session.user.user_metadata && userStore.session.user.user_metadata.last_name ? userStore.session.user.user_metadata.last_name : '';

    return first_name && last_name ? `${first_name} ${last_name}` : userStore.session.user.email;
})
const items = computed(() => [
    {
        label: 'Profile',
        items: [
            {
                label: accountLabel,
                icon: 'pi pi-user',
                command: () => {
                    router.push('/profile');
                }
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: async () => {
                    Loading.standard('Logging Out');
                    try {
                        await signOutUser();
                        toast.add({ severity: 'success', summary: 'Success', detail: 'Logout successful', life: 3000 });
                        await router.push('/auth/login');

                    } catch (e) {
                        toast.add({ severity: 'error', summary: 'Error', detail: e.message, life: 3000 });
                    }

                    Loading.remove();
                }
            }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <Button
        aria-controls="overlay_menu"
        aria-haspopup="true"
        class="p-link layout-topbar-button"
        :class="{'button-selected-top-menu' : route.path === '/profile'}"
        @click="toggle"
    >
        <i class="pi pi-user"></i>
        <span>Profile</span>
    </Button>
    <!--    <Button icon="pi pi-user" :text="route.path!=='/profile'" rounded aria-label="Filter" @click="toggle" />-->
    <Menu id="overlay_menu" ref="menu" :model="items" :popup="true" />
</template>

<style lang="scss">
.button-selected-top-menu {
    background-color: var(--primary-color) !important;
    color: var(--surface-card) !important;
}
</style>