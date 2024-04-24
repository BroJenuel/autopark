<script setup>
import ShowOccupiedModal from "@/components/ParkingSlot/ShowOccupiedModal.vue";
import ShowReservedModal from "@/components/ParkingSlot/ShowReservedModal.vue";
import StoreParkingSlot from "@/components/ParkingSlot/StoreParkingSlot.vue";
import { parkingSlot, supabaseClient } from "@/service/supabase/supabase";
import { getParkingSlots } from "@/service/supabase/table/parking_slot";
import dayjs from "dayjs";
import { Confirm, Loading } from "notiflix";
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";
import CreateIncidentReportModal from "../../../components/ParkingSlot/CreateIncidentReportModal.vue";
import MarkAsAvailableModal from "@/components/ParkingSlot/MarkAsAvailableModal.vue";
import { fetchParkingLimit } from "@/service/supabase/table/parking_limit";

const statusSelectUpdateSelected = ref(null);
const selectedSlots = ref([]);
const showUpdateStatusOfSelectedParkingSlot = ref(false);
const loading = ref(false);
const toast = useToast();
const StoreParkingSlotRef = ref();
const ShowOccupiedModalRef = ref();
const ShowReservedModalRef = ref();
const CreateIncidentReportModalRef = ref();
const MarkAsAvailableModalRef = ref();
const parkingSlots = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const parkingSlotBooking = ref([]);
const parkingLimit = ref(null);

/**
 * Calculate the time consumed based on the time started.
 * @param {string} timeStarted - The time the slot was started.
 * @returns {number} - The time consumed in minutes.
 */
function getTimeConsumed(timeStarted) {
    const timeStartedDate = dayjs(timeStarted);
    const timeNow = dayjs();
    const diff = timeNow.diff(timeStartedDate, "minute");

    return diff;
}

/**
 * Format the time consumed in minutes into a string representation.
 * @param {number} timeConsumed_min - The time consumed in minutes.
 * @returns {string} - The formatted time consumed.
 */
function formatTimeConsumed(timeConsumed_min) {
    const hours = Math.floor(timeConsumed_min / 60);
    const minutes = timeConsumed_min % 60;
    const formattedTime = hours > 0 ? `${hours}h ${minutes.toString().padStart(2, "0")}m` : `${minutes}m`;
    return timeConsumed_min ? formattedTime : "N/A";
}

async function getParkingLimit() {
    loading.value = true;
    try {
        const data = await fetchParkingLimit();
        parkingLimit.value = data.parking_limit;
    } catch (e) {
        toast.add({ severity: "error", summary: "Error", detail: e.message ?? "Unable to get the parking limit.." });
        return;
    } finally {
        loading.value = false;
    }
}

async function getParkingSlotLists() {
    loading.value = true;
    const { data, error } = await getParkingSlots();

    const getParkingSlotBooking = await supabaseClient
        .from("parking_slot_booking")
        .select("*, parking_slot(*)")
        .order("id", { ascending: false })
        .is("time_ended", null)
        .limit(1000);

    parkingSlotBooking.value = getParkingSlotBooking.data;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message });
        return;
    }

    const formattedParkingSlot = data.map((item) => {
        return {
            ...item,
            timeConsumed_min:
                item.status === "occupied"
                    ? getTimeConsumed(
                          parkingSlotBooking.value.find((booking) => {
                              return booking.parking_slot_id === item.id;
                          }).time_started,
                      )
                    : null,
        };
    });
    parkingSlots.value = formattedParkingSlot;
    loading.value = false;
}

function badgeTypeStatus(status) {
    if (status === "available") return "success";

    if (status === "occupied") return "warning";
    if (status === "reserved") return "primary";

    if (status === "not_available") return "danger";
    return "info";
}

onMounted(async () => {
    const promises = [getParkingSlotLists(), getParkingLimit()];
    await Promise.all(promises);
});

function updateParkingSlotStatus() {
    if (!statusSelectUpdateSelected.value) {
        toast.add({ severity: "warn", summary: "Oops", detail: "Please select a status", life: 3000 });
        return;
    }

    Confirm.show(
        "Update Status",
        "Are you sure you want to update status of selected parking slots?",
        "Yes",
        "No",
        async () => {
            const ids = selectedSlots.value.map((slot) => slot.id);
            const status = statusSelectUpdateSelected.value;

            Loading.standard("updating status...");

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
        },
        () => {},
        {
            // waning background orange
            okButtonBackground: "#f59e0b",
            titleColor: "#f59e0b",
        },
    );
}

function isAboutToEnd(slot) {
    const parkingSlotID = slot.id;

    if (slot.status !== "occupied") return false;

    // get booking
    const booking = parkingSlotBooking.value.find((book) => book.parking_slot_id === parkingSlotID);

    if (!booking) return false;

    const timeStarted = dayjs(booking.time_started);

    // is timeStarted passed the time limit
    const isTimeStartedPassed3Hours = dayjs().diff(timeStarted, "hour") >= parkingLimit.value ?? 3;
    if (isTimeStartedPassed3Hours) return "passedTimeLimit";

    const isAboutToEndMinutes = parkingLimit.value * 60 - 5;
    const isAboutToEnd = dayjs().diff(timeStarted, "minute") >= isAboutToEndMinutes;
    if (isAboutToEnd) return "aboutToEnd";

    return false;
}
</script>
<template>
    <ShowOccupiedModal ref="ShowOccupiedModalRef" />
    <ShowReservedModal ref="ShowReservedModalRef" @reloadParkingSlots="getParkingSlotLists" />
    <StoreParkingSlot ref="StoreParkingSlotRef" @stored="getParkingSlotLists" />
    <CreateIncidentReportModal ref="CreateIncidentReportModalRef" />
    <MarkAsAvailableModal ref="MarkAsAvailableModalRef" @reloadParkingSlots="getParkingSlotLists" />

    <Dialog
        v-model:visible="showUpdateStatusOfSelectedParkingSlot"
        :style="{ width: '30rem' }"
        header="Update Status"
        modal
    >
        <div class="mb-4">
            <Dropdown
                v-model="statusSelectUpdateSelected"
                :options="['available', 'occupied', 'closed', 'deleted']"
                class="w-full md:w-14rem"
                placeholder="Select a City"
            />
        </div>
        <Button @click="updateParkingSlotStatus">Update</Button>
        <div class="mt-4">
            <div>Slots to be udpated:</div>
            <div v-for="slot in selectedSlots" class="card" style="padding: 5px; margin-bottom: 5px">
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
            sortField="status"
            tableStyle="min-width: 50rem"
        >
            <template #header>
                <div class="flex gap-2 justify-content-between flex-wrap">
                    <div>
                        <Button
                            size="small"
                            :disabled="selectedSlots.length === 0"
                            @click="showUpdateStatusOfSelectedParkingSlot = true"
                        >
                            Change Status
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
            <Column field="timeConsumed_min" header="Time Consumed" sortable>
                <template #body="slotProps">
                    {{ formatTimeConsumed(slotProps.data.timeConsumed_min) }}
                </template>
            </Column>
            <Column field="status" header="Status" sortable>
                <template #body="slotProps">
                    <Badge
                        v-if="slotProps.data.status === 'occupied'"
                        :severity="badgeTypeStatus(slotProps.data.status)"
                        :value="slotProps.data.status"
                        style="cursor: pointer"
                        @click="ShowOccupiedModalRef.toggleModal(slotProps.data.id)"
                    ></Badge>
                    <Badge
                        v-else-if="slotProps.data.status === 'reserved'"
                        :severity="badgeTypeStatus(slotProps.data.status)"
                        :value="slotProps.data.status"
                        style="cursor: pointer"
                        @click="ShowReservedModalRef.toggleModal(slotProps.data.id)"
                    ></Badge>
                    <Badge
                        v-else
                        :severity="badgeTypeStatus(slotProps.data.status)"
                        :value="slotProps.data.status"
                    ></Badge>
                    <InlineMessage
                        v-if="isAboutToEnd(slotProps.data) === 'passedTimeLimit'"
                        class="mt-2"
                        severity="error"
                    >
                        This already passed {{ parkingLimit ?? 3 }} hours.
                    </InlineMessage>
                    <InlineMessage v-if="isAboutToEnd(slotProps.data) === 'aboutToEnd'" class="mt-2" severity="warn">
                        This occupied slot is about to end.
                    </InlineMessage>
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <div className="flex gap-2">
                        <Button
                            class="p-button-success"
                            icon="pi pi-pencil"
                            @click="StoreParkingSlotRef.toggleModal(slotProps.data)"
                            v-tooltip="'Edit'"
                            rounded
                        />
                        <Button
                            v-if="slotProps.data.status === 'reserved'"
                            class="p-button-primary"
                            icon="pi pi-money-bill"
                            severity="secondary"
                            @click="ShowReservedModalRef.toggleModal(slotProps.data.id)"
                            v-tooltip="'Mark as Paid'"
                            rounded
                        />
                        <Button
                            v-if="slotProps.data.status === 'occupied'"
                            icon="pi pi-check"
                            severity="info"
                            @click="MarkAsAvailableModalRef.toggleModal(slotProps.data.id)"
                            v-tooltip="'Mark as Available'"
                            rounded
                        />
                        <Button
                            v-if="
                                slotProps.data.status === 'occupied' &&
                                isAboutToEnd(slotProps.data) === 'passedTimeLimit'
                            "
                            class="p-button-danger"
                            icon="pi pi-file"
                            @click="CreateIncidentReportModalRef.toggleModal(slotProps.data.id)"
                            v-tooltip="'Create incident report'"
                            rounded
                        />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
