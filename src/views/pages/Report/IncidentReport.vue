<script setup>
import PayBookingModal from "@/components/BookingList/PayBookModal.vue";
import { fetchAllIncidentReportsWithParkingSlot } from "@/service/supabase/table/incident_report";
import dayjs from "dayjs";
import { Loading } from "notiflix";
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";

const PayBookingModalRef = ref(false);
const loading = ref(false);
const toast = useToast();
const incidentReports = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

async function getIncidentReports() {
    try {
        Loading.standard();
        const data = await fetchAllIncidentReportsWithParkingSlot();
        incidentReports.value = data;
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: e.message ?? "Unable to get incident reports",
            life: 3000,
        });
    } finally {
        Loading.remove();
    }
}

onMounted(() => {
    getIncidentReports();
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
                :value="incidentReports"
                sortField="created_at"
                tableStyle="min-width: 70rem"
            >
                <template #header>
                    <div class="flex justify-content-end">
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </IconField>
                    </div>
                </template>
                <Column field="id" header="#"></Column>
                <Column field="parking_slot" header="Parking Slot">
                    <template #body="slotProps">
                        <div class="flex flex-column gap-4">
                            <div>
                                {{ slotProps.data.parking_slot_booking.parking_slot.area }}
                                {{ slotProps.data.parking_slot_booking.parking_slot.street }}
                            </div>
                            <div>
                                <div>Driver Details:</div>
                                <div>
                                    <span>
                                        {{ slotProps.data.parking_slot_booking.user_profile.data.first_name }}
                                        {{ ` ` }}
                                        {{ slotProps.data.parking_slot_booking.user_profile.data.last_name }}
                                    </span>
                                </div>
                                <div>
                                    {{ slotProps.data.parking_slot_booking.user_profile.data.driver_license }}
                                </div>
                                <div>
                                    {{ slotProps.data.parking_slot_booking.user_profile.data.contact_number }}
                                </div>
                            </div>
                        </div>
                    </template>
                </Column>
                <Column field="description" header="Incident" sortable></Column>
                <Column field="image" header="Image">
                    <template #body="slotProps">
                        <Image
                            v-if="!!slotProps.data?.image?.fullPath"
                            :src="`https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${slotProps.data.image.fullPath}`"
                            alt="Image"
                            preview
                            width="150"
                        />
                        <span v-else>No Image</span>
                    </template>
                </Column>
                <Column field="created_at" header="Date Created" sortable>
                    <template #body="slotProps">
                        {{ dayjs(slotProps.data.created_at).format("D-MMM-YY HH:mm") }}
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
