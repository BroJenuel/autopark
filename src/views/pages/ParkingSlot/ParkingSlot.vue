<script setup>
import { onMounted, ref } from "vue";
import { getParkingSlots } from "@/service/supabase/table/parking_slot";
import StoreParkingSlot from "@/components/ParkingSlot/StoreParkingSlot.vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import ShowOccupiedModal from "@/components/ParkingSlot/ShowOccupiedModal.vue";

const loading = ref(false);
const toast = useToast();
const StoreParkingSlotRef = ref();
const ShowOccupiedModalRef = ref();
const parkingSlots = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
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
    <ShowOccupiedModal ref="ShowOccupiedModalRef" />
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
            :globalFilterFields="['area', 'street', 'latitude', 'longitude', 'status']"
            :loading="loading"
            :sortOrder="-1"
            :value="parkingSlots"
            sortField="created_at"
            tableStyle="min-width: 50rem"
        >
            <template #header>
                <div class="flex justify-content-end">
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
            <Column field="area" header="Area" sortable></Column>
            <Column field="street" header="Street" sortable></Column>
            <Column field="latitude" header="Latitude" sortable></Column>
            <Column field="longitude" header="Longitude" sortable></Column>
            <Column field="status" header="Status" sortable>
                <template #body="slotProps">
                    <Badge v-if="slotProps.data.status === 'occupied'"
                           :severity="badgeTypeStatus(slotProps.data.status)" :value="slotProps.data.status"
                           style="cursor: pointer;"
                           @click="ShowOccupiedModalRef.toggleModal(slotProps.data.id)"
                    ></Badge>
                    <Badge v-else :severity="badgeTypeStatus(slotProps.data.status)" :value="slotProps.data.status"
                    ></Badge>
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
