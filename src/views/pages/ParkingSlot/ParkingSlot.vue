<script setup>
import { onMounted, ref } from "vue";
import { getParkingSlots } from "@/service/supabase/table/parking_slot";
import StoreParkingSlot from "@/components/ParkingSlot/StoreParkingSlot.vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import ShowOccupiedModal from "@/components/ParkingSlot/ShowOccupiedModal.vue";
import { Confirm, Loading } from "notiflix";
import { parkingSlot } from "@/service/supabase/supabase";

const statusSelectUpdateSelected = ref(null);
const selectedSlots = ref([]);
const showUpdateStatusOfSelectedParkingSlot = ref(false);
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

function updateParkingSlotStatus() {
    if (!statusSelectUpdateSelected.value)
    {
        toast.add({ severity: "warn", summary: "Oops", detail: "Please select a status", life: 3000 });
        return;
    }


    Confirm.show("Update Status", "Are you sure you want to update status of selected parking slots?", "Yes", "No", async () => {
        const ids = selectedSlots.value.map(slot => slot.id);
        const status = statusSelectUpdateSelected.value;

        Loading.standard("updateing status...");

        const { data, error } = await parkingSlot.updateParkingSlotStatus(ids, status);

        Loading.remove();

        if (error) {
            toast.add({ severity: "error", summary: "Error", detail: error.message });
            return;
        }

        toast.add({ severity: "success", summary: "Success", detail: "Status updated successfully", life: 3000 });
        await getParkingSlotLists();
        selectedSlots.value = [];
        statusSelectUpdateSelected.value = null;
        showUpdateStatusOfSelectedParkingSlot.value = false;

    }, () => {}, {
        // waning background orange
        okButtonBackground: "#f59e0b",
        titleColor: "#f59e0b"
    });
}
</script>
<template>
    <ShowOccupiedModal ref="ShowOccupiedModalRef" />
    <StoreParkingSlot ref="StoreParkingSlotRef" @stored="getParkingSlotLists" />
    <Dialog v-model:visible="showUpdateStatusOfSelectedParkingSlot" :style="{ width: '30rem' }" header="Update Status"
            modal>
        <div class="mb-4">
            <Dropdown v-model="statusSelectUpdateSelected" :options="['available','occupied','closed','deleted']"
                      class="w-full md:w-14rem"
                      placeholder="Select a City" />
        </div>
        <Button @click="updateParkingSlotStatus">Update</Button>
        <div class="mt-4">
            <div>Slots to be udpated:</div>
            <div v-for="slot in selectedSlots" class="card" style="padding: 5px; margin-bottom: 5px;">
                <div>Area: {{ slot.area }}</div>
                <div>Street: {{ slot.street }}</div>
            </div>
        </div>
    </Dialog>
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
            v-model:selection="selectedSlots"
            :globalFilterFields="['area', 'street', 'latitude', 'longitude', 'status']"
            :loading="loading"
            :sortOrder="-1"
            :value="parkingSlots"
            data-key="id"
            sortField="created_at"
            tableStyle="min-width: 50rem"
        >
            <template #header>
                <div class="flex gap-2 justify-content-between flex-wrap">
                    <div>
                        <Button size="small" :disabled="selectedSlots.length === 0"
                                @click="showUpdateStatusOfSelectedParkingSlot = true">Change Status
                        </Button>
                    </div>
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template>
            <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
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
