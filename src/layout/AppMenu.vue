<script setup>
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { userStore } from '@/store/userStore';

const user = userStore();

const model = computed(() => {
    const session = user.session ?? null;
    const role = session ? session.user.role : false;

    const isAdmin = role === 'service_role'
    // const role = session.
    return session ?[
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Events', icon: 'pi pi-fw pi-calendar', to: '/events' },
                { label: 'Announcements', icon: 'pi pi-fw pi-bell', to: '/announcement' },
                {
                    label: 'Parking',
                    icon: 'pi pi-fw pi-car',
                    visible: isAdmin,
                    items: [
                        { label: 'Manage Slots', icon: 'pi pi-fw pi-map', to: '/parking-slot' }
                    ]
                },
                {
                    visible: isAdmin,
                    label: 'Manage Events/Announc.',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/manage-events-and-announcements'
                }
            ]
        },
        {
            label: 'Maintenance',
            visible: isAdmin,
            items: [
                { label: 'Street', icon: 'pi pi-fw pi-map', to: '/maintenance/street' },
                { label: 'Rates', icon: 'pi pi-fw pi-dollar', to: '/maintenance/rates' }
            ]
        },
        {
            label: 'Users',
            visible: isAdmin,
            items: [
                { label: 'Admin', icon: 'pi pi-fw pi-user', to: '/manage-users/admin' },
                { label: 'Team Leader', icon: 'pi pi-fw pi-user', to: '/manage-users/team-leader' },
                { label: 'Registered User', icon: 'pi pi-fw pi-user', to: '/manage-users/registered-users' },
                { label: 'Registered Attendant', icon: 'pi pi-fw pi-user', to: '/manage-users/registered-attendant' }
            ]
        },
        {
            label: 'Reports',
            visible: isAdmin,
            items: [
                {
                    label: 'Reports',
                    icon: 'pi pi-fw pi-file',
                    items: [
                        { label: 'Completed Booking', icon: 'pi pi-fw pi-file', to: '/reports/completed-booking' },
                        { label: 'Online Payment', icon: 'pi pi-fw pi-file', to: '/reports/online-payment' },
                        { label: 'Manual Payment', icon: 'pi pi-fw pi-file', to: '/reports/manual-payment' },
                        { label: 'Incident Report', icon: 'pi pi-fw pi-file', to: '/reports/incident-report' }
                    ]
                }
            ]
        }
    ] : [];
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :index="i" :item="item"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
