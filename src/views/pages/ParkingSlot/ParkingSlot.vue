<script setup>
import { onMounted, ref } from "vue";
import { getParkingSlots } from "@/service/supabase/table/parking_slot";
import StoreParkingSlot from "@/components/ParkingSlot/StoreParkingSlot.vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";

const loading = ref(false);
const toast = useToast();
const StoreParkingSlotRef = ref();
const parkingSlots = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

async function getParkingSlotLists() {
    loading.value = true;
    const { data, error } = await getParkingSlots();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message });
        return;
    }

    parkingSlots.value = data;
    loading.value = false;
}

function badgeTypeStatus(status) {
    if (status === "available") return "success";
    if (status === "occupied") return "warning";
    if (status === "not_available") return "danger";
    return "info";
}

onMounted(async () => {
    await getParkingSlotLists();
});

const products = ref();
</script>
<template>
    <StoreParkingSlot ref="StoreParkingSlotRef" @stored="getParkingSlotLists" />
    <div class="card">
        <div class="flex justify-content-between align-items-center">
            <h3><span class="pi pi-fw pi-map" style="font-size: 1.5rem"></span> Manage Slots</h3>
            <div class="flex align-items-center">
                <Button class="mr-2" icon="pi pi-plus" label="Create" @click="StoreParkingSlotRef.toggleModal()" />
                <Button icon="pi pi-refresh" severity="secondary" title="Refresh" @click="getParkingSlotLists()" />
            </div>
        </div>
        <DataTable
            v-model:filters="filters"
            sortField="created_at"
            :sortOrder="-1"
            :value="parkingSlots"
            tableStyle="min-width: 50rem"
            :loading="loading"
            :globalFilterFields="['area', 'street', 'latitude', 'longitude', 'status']"
        >
            <template #header>
                <div class="flex justify-content-end">
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </span>
                </div>
            </template>
            <Column field="created_at" sortable header="Date Created">
                <template #body="slotProps">
                    {{ new Date(slotProps.data.created_at).toLocaleString() }}
                </template>
            </Column>
            <Column field="area" sortable header="Area"></Column>
            <Column field="street" sortable header="Street"></Column>
            <Column field="latitude" sortable header="Latitude"></Column>
            <Column field="longitude" sortable header="Longitude"></Column>
            <Column field="status" sortable header="Status">
                <template #body="slotProps">
                    <Badge :value="slotProps.data.status" :severity="badgeTypeStatus(slotProps.data.status)"></Badge>
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button
                        class="p-button-rounded p-button-success mr-2"
                        icon="pi pi-pencil"
                        @click="StoreParkingSlotRef.toggleModal(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
