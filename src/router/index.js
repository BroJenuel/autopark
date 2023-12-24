import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { isSignedIn } from '@/service/supabase/supabase';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn();
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {
                            next();
                        }
                    }
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: () => import('@/views/user/profile.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn();
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {
                            next();
                        }
                    }
                },
                {
                    path: 'events',
                    name: 'Events',
                    component: () => import('@/views/pages/events/Events.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn();
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {
                            next();
                        }
                    }
                },
                {
                    path: 'announcement',
                    name: 'Announcement',
                    component: () => import('@/views/pages/Announcement/Announcement.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn();
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {
                            next();
                        }
                    }
                },
                {
                    path: 'parking-slot',
                    name: 'Parking Slot',
                    component: () => import('@/views/pages/ParkingSlot/ParkingSlot.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn(false);
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {

                            if (signedIn.user.role !== 'service_role') {
                                next({ name: 'dashboard' });
                            }
                            next();
                        }
                    }
                },
                {
                    path: 'manage-events-and-announcements',
                    name: 'Manage Events And Announcements',
                    component: () => import('@/views/pages/ManageEventsAndAnnouncements/ManageEventsAndAnnouncements.vue'),
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn(false);
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {

                            if (signedIn.user.role !== 'service_role') {
                                next({ name: 'dashboard' });
                            }
                            next();
                        }
                    }
                },
                {
                    path: 'maintenance',
                    name: 'Maintenance',
                    children: [
                        {
                            path: 'street',
                            name: 'Street',
                            component: () => import('@/views/pages/Maintenance/Street.vue'),
                            beforeEnter: async (to, from, next) => {
                                const signedIn = await isSignedIn(false);
                                if (!signedIn) {
                                    next({ name: 'login' });
                                } else {

                                    if (signedIn.user.role !== 'service_role') {
                                        next({ name: 'dashboard' });
                                    }
                                    next();
                                }
                            }
                        },
                        {
                            path: 'rates',
                            name: 'Rates',
                            component: () => import('@/views/pages/Maintenance/Rates.vue'),
                            beforeEnter: async (to, from, next) => {
                                const signedIn = await isSignedIn(false);
                                if (!signedIn) {
                                    next({ name: 'login' });
                                } else {

                                    if (signedIn.user.role !== 'service_role') {
                                        next({ name: 'dashboard' });
                                    }
                                    next();
                                }
                            }
                        }
                    ]
                },
                {
                    path: 'manage-users',
                    name: 'Manage Users',
                    children: [
                        {
                            path: 'admin',
                            name: 'Admin',
                            component: () => import('@/views/pages/Users/Admin.vue')
                        },
                        {
                            path: 'team-leader',
                            name: 'Team Leader',
                            component: () => import('@/views/pages/Users/ManageTeamLeader.vue')
                        },
                        {
                            path: 'registered-users',
                            name: 'Registered Users',
                            component: () => import('@/views/pages/Users/RegisteredUser.vue')
                        },
                        {
                            path: 'registered-attendant',
                            name: 'Registered Attendant',
                            component: () => import('@/views/pages/Users/RegisteredAttendant.vue')
                        }
                    ],
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn(false);
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {

                            if (signedIn.user.role !== 'service_role') {
                                next({ name: 'dashboard' });
                            }
                            next();
                        }
                    }
                },
                {
                    path: 'reports',
                    name: 'Reports',
                    children: [
                        {
                            path: 'completed-booking',
                            name: 'Completed Booking',
                            component: () => import('@/views/pages/Report/CompletedBooking.vue')
                        },
                        {
                            path: 'online-payment',
                            name: 'Online Payment',
                            component: () => import('@/views/pages/Report/OnlinePayment.vue')
                        },
                        {
                            path: 'manual-payment',
                            name: 'Manual Payment',
                            component: () => import('@/views/pages/Report/ManualPayment.vue')
                        },
                        {
                            path: 'incident-report',
                            name: 'Incident Report',
                            component: () => import('@/views/pages/Report/IncidentReport.vue')
                        }
                    ],
                    beforeEnter: async (to, from, next) => {
                        const signedIn = await isSignedIn(false);
                        if (!signedIn) {
                            next({ name: 'login' });
                        } else {

                            if (signedIn.user.role !== 'service_role') {
                                next({ name: 'dashboard' });
                            }
                            next();
                        }
                    }

                }
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        }
    ]
});

export default router;
