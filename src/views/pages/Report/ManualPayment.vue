<script setup>
import { supabaseClient } from "@/service/supabase/supabase";
import { useUserStore } from "@/store/userStore";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import dayjs from "dayjs";
import PayBookingModal from "@/components/BookingList/PayBookModal.vue";
import GCashLogo from "@/assets/images/gcash logo.png";

const PayBookingModalRef = ref(false);
const loading = ref(false);
const toast = useToast();
const router = useRouter();
const userStore = useUserStore();
const bookLists = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

async function getBookingList() {
    loading.value = true;
    const { data, error } = await supabaseClient
        .from("parking_slot_booking")
        .select("*, parking_slot(*)")
        .order("id", { ascending: false })
        .not("time_ended", "is", null)
        .eq("payment_method", "cod")
        .limit(1000);

    loading.value = false;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    bookLists.value = data.map((book) => ({
        ...book,
        status: book.time_ended ? "Done" : "Pending",
    }));
}

function badgeTypeStatus(status) {
    if (status === "Done") return "success";
    if (status === "Pending") return "info";
    return "info";
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
                <h5>Booking Paid Manually</h5>
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
                    <div class="flex justify-content-end">
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </IconField>
                    </div>
                </template>
                <Column field="created_at" header="Date Created" sortable>
                    <template #body="slotProps">
                        {{ new Date(slotProps.data.created_at).toLocaleString() }}
                    </template>
                </Column>
                <Column field="parking_slot" header="Area">
                    <template #body="{ data }">
                        <div>
                            <div>
                                Area: <b>{{ data.parking_slot.area }}, {{ data.parking_slot.street }}</b>
                            </div>
                            <div>
                                LatLng: <b>{{ data.parking_slot.latitude }} - {{ data.parking_slot.longitude }}</b>
                            </div>
                        </div>
                    </template>
                </Column>
                <Column field="status" header="Status" sortable>
                    <template #body="{ data }">
                        <Badge :severity="badgeTypeStatus(data.status)" :value="data.status"></Badge>
                    </template>
                </Column>
                <Column field="time_started" header="Time Started" sortable>
                    <template #body="{ data }">
                        {{ dayjs(data.time_started).format("YYYY-MM-DD hh:mm a") }}
                    </template>
                </Column>
                <Column field="time_ended" header="Time Ended" sortable>
                    <template #body="{ data }">
                        {{ data.time_ended ? dayjs(data.time_ended).format("YYYY-MM-DD hh:mm a") : "--" }}
                    </template>
                </Column>
                <Column field="payment_amount" header="Paid Amount" sortable>
                    <template #body="{ data }">
                        {{ data.payment_amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" }) }}
                    </template>
                </Column>
                <Column field="payment_method" header="Payment Method" sortable>
                    <template #body="{ data }">
                        <Badge v-if="data.payment_method === 'cod'">Cash On Hand</Badge>
                        <img
                            v-else-if="data.payment_method === 'gcash'"
                            :src="GCashLogo"
                            alt=""
                            class="bg-white p-1"
                            width="60"
                            style="border-radius: 8px"
                        />
                        <div v-else>--</div>
                    </template>
                </Column>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button
                            v-if="!(data.payment_amount > 0)"
                            icon="pi pi-money-bill"
                            label="Pay"
                            rounded
                            severity="warning"
                            @click="PayBookingModalRef.toggleModal(data)"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
