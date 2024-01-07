<script setup>
import { computed, onMounted, ref } from 'vue';
import { supabaseClient } from '@/service/supabase/supabase';
import { Loading } from 'notiflix';

const dataCounts = ref([]);
const userRolesCount = ref([]);

onMounted(async () => {
    Loading.standard('loading data...');
    const onProgressBooking = await supabaseClient
        .from('parking_slot_booking')
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