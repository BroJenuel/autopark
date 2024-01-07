import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { isSignedIn } from '@/service/supabase/supabase';

const anyoneCanAccess = async (to, from, next) => {
    const signedIn = await isSignedIn();
    if (!signedIn) {
        next({ name: 'login' });
    } else {
        next();
    }
};

const adminParkingAttendantTeamLeaderRoutes = async (to, from, next) => {
    const signedIn = await isSignedIn(false);
    if (!signedIn) {
        next({ name: 'login' });
    } else {

        if (signedIn.user.role === 'service_role' || signedIn.user.role === 'supabase_admin' || signedIn.user.role === 'admin' || signedIn.user.app_metadata.role === 'team_leader' || signedIn.user.app_metadata.role === 'parking_attendant') {
            next();
            return;
        }

        next({ name: 'dashboard' });

    }
};

const adminOnly = async (to, from, next) => {
    const signedIn = await isSignedIn(false);
    if (!signedIn) {
        next({ name: 'login' });
    } else {

        if (signedIn.user.role === 'service_role' || signedIn.user.role === 'supabase_admin' || signedIn.user.role === 'admin') {
            next();
            return;
        }

        next({ name: 'dashboard' });
    }
};

const adminAndTeamLeaderOnly = async (to, from, next) => {
    const signedIn = await isSignedIn(false);
    if (!signedIn) {
        next({ name: 'login' });
    } else {

        if (signedIn.user.role === 'service_role' || signedIn.user.role === 'supabase_admin' || signedIn.user.role === 'admin' || signedIn.user.app_metadata.role === 'team_leader') {
            next();
            return;
        }

        next({ name: 'dashboard' });
    }
};

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
                    beforeEnter: anyoneCanAccess
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: () => import('@/views/user/profile.vue'),
                    beforeEnter: anyoneCanAccess
                },
                {
                    path: 'events',
                    name: 'Events',
                    component: () => import('@/views/pages/events/Events.vue'),
                    beforeEnter: anyoneCanAccess
                },
                {
                    path: 'announcement',
                    name: 'Announcement',
                    component: () => import('@/views/pages/Announcement/Announcement.vue'),
                    beforeEnter: anyoneCanAccess
                },
                {
                    path: 'parking-slot',
                    name: 'Parking Slot',
                    component: () => import('@/views/pages/ParkingSlot/ParkingSlot.vue'),
                    beforeEnter: adminParkingAttendantTeamLeaderRoutes
                },
                {
                    path: 'available-parking',
                    name: 'Available Parking',
                    component: () => import('@/views/pages/ParkingSlot/AvailableParking.vue'),
                    beforeEnter: anyoneCanAccess
                },
                {
                    path: 'manage-events-and-announcements',
                    name: 'Manage Events And Announcements',
                    component: () => import('@/views/pages/ManageEventsAndAnnouncements/ManageEventsAndAnnouncements.vue'),
                    beforeEnter: adminOnly
                },
                {
                    path: 'maintenance',
                    name: 'Maintenance',
                    children: [
                        {
                            path: 'street',
                            name: 'Street',
                            component: () => import('@/views/pages/Maintenance/Street.vue'),
                            beforeEnter: adminOnly
                        },
                        {
                            path: 'rates',
                            name: 'Rates',
                            component: () => import('@/views/pages/Maintenance/Rates.vue'),
                            beforeEnter: adminOnly
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
                            component: () => import('@/views/pages/Users/Admin.vue'),
                            beforeEnter: adminOnly
                        },
                        {
                            path: 'team-leader',
                            name: 'Team Leader',
                            component: () => import('@/views/pages/Users/ManageTeamLeader.vue'),
                            beforeEnter: adminOnly
                        },
                        {
                            path: 'registered-users',
                            name: 'Registered Users',
                            component: () => import('@/views/pages/Users/RegisteredUser.vue'),
                            beforeEnter: adminAndTeamLeaderOnly
                        },
                        {
                            path: 'registered-attendant',
                            name: 'Registered Attendant',
                            component: () => import('@/views/pages/Users/RegisteredAttendant.vue'),
                            beforeEnter: adminAndTeamLeaderOnly
                        }
                    ]

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
                    beforeEnter: adminAndTeamLeaderOnly

                },
                {
                    path: 'my-bookings',
                    name: 'My Bookings',
                    component: () => import('@/views/pages/Booking/BookingList.vue'),
                    beforeEnter: anyoneCanAccess
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
