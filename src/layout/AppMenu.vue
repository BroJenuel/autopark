<script setup>
import { computed, onMounted, ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { useUserStore } from '@/store/userStore';

const user = useUserStore();

const adminModal = [
    {
        label: 'Main',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Events', icon: 'pi pi-fw pi-calendar', to: '/events' },
            { label: 'Announcements', icon: 'pi pi-fw pi-bell', to: '/announcement' },
            {
                label: 'Parking',
                icon: 'pi pi-fw pi-car',
                items: [
                    { label: 'Manage Slots', icon: 'pi pi-fw pi-map', to: '/parking-slot' }
                ]
            },
            {
                label: 'Manage Events/Announc.',
                icon: 'pi pi-fw pi-calendar',
                to: '/manage-events-and-announcements'
            }
        ]
    },
    {
        label: 'Maintenance',
        items: [
            { label: 'Street', icon: 'pi pi-fw pi-map', to: '/maintenance/street' },
            { label: 'Rates', icon: 'pi pi-fw pi-dollar', to: '/maintenance/rates' }
        ]
    },
    {
        label: 'Users',
        items: [
            { label: 'Admin', icon: 'pi pi-fw pi-user', to: '/manage-users/admin' },
            { label: 'Team Leader', icon: 'pi pi-fw pi-user', to: '/manage-users/team-leader' },
            { label: 'Registered User', icon: 'pi pi-fw pi-user', to: '/manage-users/registered-users' },
            { label: 'Registered Attendant', icon: 'pi pi-fw pi-user', to: '/manage-users/registered-attendant' }
        ]
    },
    {
        label: 'Reports',
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
];

const driverMenu = [
    {
        label: 'Main',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Events', icon: 'pi pi-fw pi-calendar', to: '/events' },
            { label: 'Announcements', icon: 'pi pi-fw pi-bell', to: '/announcement' },
        ]
    },
];

const parkingAttendantMenu = [
    {
        label: 'Main',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Events', icon: 'pi pi-fw pi-calendar', to: '/events' },
            { label: 'Announcements', icon: 'pi pi-fw pi-bell', to: '/announcement' },
            {
                label: 'Parking',
                icon: 'pi pi-fw pi-car',
                items: [
                    { label: 'Manage Slots', icon: 'pi pi-fw pi-map', to: '/parking-slot' }
                ]
            },
        ]
    },
]

const model = ref([]);

onMounted(() => {
    const role = user.session.user.role;
    if (role === 'admin' || role === 'service_role' || role === 'supabase_admin') {
        model.value = adminModal;
    } else if (role === 'driver' || role === 'authenticated') {
        model.value = driverMenu;
    } else if (role === 'parking_attendant') {
        model.value = parkingAttendantMenu;

    }
})
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
