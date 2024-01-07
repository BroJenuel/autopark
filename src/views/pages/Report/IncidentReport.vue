<script setup>

import { supabaseClient } from '@/service/supabase/supabase';
import { useUserStore } from '@/store/userStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import dayjs from 'dayjs';
import PayBookingModal from '@/components/BookingList/PayBookModal.vue';
import GCashLogo from '@/assets/images/gcash logo.png';

const PayBookingModalRef = ref(false);
const loading = ref(false);
const toast = useToast();
const router = useRouter();
const userStore = useUserStore();
const bookLists = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

async function getBookingList() {

}

function badgeTypeStatus(status) {
    if (status === 'Done') return 'success';
    if (status === 'Pending') return 'info';
    return 'info';
}

onMounted(() => {
    getBookingList();
});

</script>

<template>
    <div>
        <PayBookingModal ref="PayBookingModalRef" @paid="getBookingList()" />
        <div class="card">
            <div class="flex justify-content-between align-items-center flex-wrap">
                <h5>Incident Report</h5>
                <div class="flex align-items-center gap-3 flex-wrap">
                    <Button icon="pi pi-refresh" label="Refresh" severity="secondary" @click="getBookingList()" />
                </div>
            </div>
            <DataTable
                v-model:filters="filters"
                :globalFilterFields="['parking_slot.area', 'parking_slot.street', 'id', 'payment_method', 'status']"
                :loading="loading"
                :sortOrder="-1"
                :value="bookLists"
                sortField="created_at"
                tableStyle="min-width: 70rem"
            >
                <template #header>
                    <div class="flex md:justify-content-end">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </span>
                    </div>
                </template>
                <Column field="created_at" header="Date Created" sortable>
                    <template #body="slotProps">
                        {{ new Date(slotProps.data.created_at).toLocaleString() }}
                    </template>
                </Column>
                <Column field="id" header="#"></Column>
                <Column field="parking_slot" header="Parking Slot" sortable></Column>
                <Column field="incident" header="Incident" sortable></Column>
            </DataTable>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>