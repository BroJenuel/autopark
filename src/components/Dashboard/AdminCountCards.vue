<script setup>
import { computed, onMounted, ref } from 'vue';
import { supabaseClient } from '@/service/supabase/supabase';
import { Loading } from 'notiflix';

const dataCounts = ref([]);
const userRolesCount = ref([]);
const totalParkingSlots = computed(() => {
    let count = 0;
    for (const item of dataCounts.value) {
        count += item.status_count;
    }
    return count;
});


const totalAvailableSlots = computed(() => {
    let count = 0;
    for (const item of dataCounts.value) {
        if (item.status_value === 'available') count += item.status_count;
    }
    return count;
});

const occupiedSlots = computed(() => {
    let count = 0;
    for (const item of dataCounts.value) {
        if (item.status_value === 'occupied') count += item.status_count;
    }
    return count;
});

const notAvailableSlots = computed(() => {
    let count = 0;
    for (const item of dataCounts.value) {
        if (item.status_value === 'not_available') count += item.status_count;
    }
    return count;
});

const adminsCount = computed(() => {
    let count = 0;
    for (const item of userRolesCount.value) {
        if (item.role_value === 'admin') count += item.role_count;
    }
    return count;
});

const parkingAttendantCount = computed(() => {
    let count = 0;
    for (const item of userRolesCount.value) {
        if (item.role_value === 'parking_attendant') count += item.role_count;
    }
    return count;
});

const teamLeaderCount = computed(() => {
    let count = 0;
    for (const item of userRolesCount.value) {
        if (item.role_value === 'team_leader') count += item.role_count;
    }
    return count;
});

const driverCount = computed(() => {
    let count = 0;
    for (const item of userRolesCount.value) {
        if (item.role_value === 'driver') count += item.role_count;
    }
    return count;
});

onMounted(async () => {
    Loading.standard('loading data...');
    const parkingSlotCount = await supabaseClient.rpc('get_parking_slot_counts_function');
    const userRolesCountData = await supabaseClient.rpc('get_user_roles_count_function');
    Loading.remove();

    dataCounts.value = parkingSlotCount.data;
    userRolesCount.value = userRolesCountData.data;
});
</script>

<template>
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Parking Slots</span>
                        <div class="text-900 font-medium text-xl">{{ totalParkingSlots }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">3 new </span>
                <span class="text-500">since last visit</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Available Slot</span>
                        <div class="text-900 font-medium text-xl">{{ totalAvailableSlots }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">%52+ </span>
                <span class="text-500">since last week</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Occupied Slots</span>
                        <div class="text-900 font-medium text-xl">{{ occupiedSlots }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-cyan-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium">0 </span>
                <span class="text-500">occupied parking slots</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">No Available</span>
                        <div class="text-900 font-medium text-xl">{{ notAvailableSlots }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-red-500 text-xl"></i>
                    </div>
                </div>
                <!--                <span class="text-green-500 font-medium">85 </span>-->
                <span class="text-500">Not Available Parking Slots</span>
            </div>
        </div>


        <!--        User Counts -->
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Admins</span>
                        <div class="text-900 font-medium text-xl">{{ adminsCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl"></i>
                    </div>
                </div>
                <!--                <span class="text-green-500 font-medium">85 </span>-->
                <span class="text-500">Number of Admins</span>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Attendant</span>
                        <div class="text-900 font-medium text-xl">{{ parkingAttendantCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl"></i>
                    </div>
                </div>
                <!--                <span class="text-green-500 font-medium">85 </span>-->
                <span class="text-500">Parking Attendants</span>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Leaders</span>
                        <div class="text-900 font-medium text-xl">{{ teamLeaderCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl"></i>
                    </div>
                </div>
                <!--                <span class="text-green-500 font-medium">85 </span>-->
                <span class="text-500">Registered Team Leaders</span>
            </div>
        </div>

        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0 h-full">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Drivers</span>
                        <div class="text-900 font-medium text-xl">{{ driverCount }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                         style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl"></i>
                    </div>
                </div>
                <!--                <span class="text-green-500 font-medium">85 </span>-->
                <span class="text-500">Registered Users</span>
            </div>
        </div>
    </div>
</template>