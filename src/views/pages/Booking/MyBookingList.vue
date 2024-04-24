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
import { autoParkPaymentMethods } from "@/utils/payment";
import { Confirm, Loading } from "notiflix";

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
        .eq("user_id", userStore.id)
        .order("id", { ascending: false })
        .limit(1000);

    loading.value = false;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    bookLists.value = data.map((book) => {
        let status = book.time_ended ? "Done" : "Pending";

        if (!book.time_ended && ["gcash", "maya"].includes(book.payment_method)) {
            status = "Occupied";
        }

        if (book.payment_method === "cod" && !book.payment_amount && !book.time_ended) {
            const timeStarted = dayjs(book.time_started);
            const is15MinutePassed = dayjs().diff(timeStarted, "minute") >= 15;

            status = is15MinutePassed ? "Closed" : "Reserved";
        }

        if (!book.time_ended && book.payment_method === "cod" && !!book.payment_amount) {
            status = "Occupied";
        }

        return {
            ...book,
            status,
        };
    });
}

function badgeTypeStatus(status) {
    if (status === "Done") return "success";
    if (status === "Pending") return "warning";
    if (status === "Occupied") return "info";
    if (status === "Closed") return "danger";
    return "info";
}

const screenWidthSize = ref(window.innerWidth);

onMounted(() => {
    getBookingList();

    window.addEventListener("resize", () => {
        screenWidthSize.value = window.innerWidth;
    });
});

function isAboutToEnd(booking) {
    if (!booking) return false;

    if (booking.status === "Occupied") {
        const timeStarted = dayjs(booking.time_started);

        // is timeStarted passed 3 hours
        const isTimeStartedPassed3Hours = dayjs().diff(timeStarted, "hour") >= 3;
        if (isTimeStartedPassed3Hours) return "passed3Hours";

        // check if its about to end 5 minutes before 3 hours
        const isAboutToEnd = dayjs().diff(timeStarted, "minute") >= 120 && dayjs().diff(timeStarted, "hour") < 3;
        if (isAboutToEnd) return "aboutToEnd";

        return false;
    }
    return false;
}

async function cancelBooking(booking) {
    const parkingSlotId = booking.parking_slot_id;

    Confirm.show(
        "Cancel this booking?",
        "Are you sure you want to cancel this booking?",
        "Yes",
        "No",
        async () => {
            Loading.standard();

            const bookingList = await supabaseClient
                .from("parking_slot")
                .update({
                    status: "available",
                })
                .eq("id", parkingSlotId)
                .select();

            const bookingListSlot = await supabaseClient
                .from("parking_slot_booking")
                .update({
                    time_ended: new Date(),
                })
                .eq("parking_slot_id", parkingSlotId)
                .select();

            await getBookingList();

            Loading.remove();
        },
        () => {},
        {
            okButtonBackground: "rgb(255 0 0 / 50%)",
            titleColor: "red",
        },
    );
}
</script>

<template>
    <div>
        <PayBookingModal ref="PayBookingModalRef" @paid="getBookingList()" />
        <div class="card">
            <div class="flex justify-content-between align-items-center flex-wrap">
                <h5>My Booking List</h5>
                <div class="flex align-items-center gap-3 flex-wrap">
                    <Button icon="pi pi-plus" label="Book" @click="router.push('/available-parking')" />
                    <Button icon="pi pi-refresh" label="Refresh" severity="secondary" @click="getBookingList()" />
                </div>
            </div>
            <DataTable
                v-if="screenWidthSize > 676"
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
                        <InlineMessage v-if="isAboutToEnd(data) === 'aboutToEnd'" class="mt-2" severity="warn">
                            This occupied slot is about to end.
                        </InlineMessage>
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
                        <img
                            v-else-if="data.payment_method === 'maya'"
                            src="https://www.rankthemag.ph/wp-content/uploads/2022/05/Maya2-700x283.jpg"
                            alt=""
                            class="bg-white p-1"
                            width="60"
                            style="border-radius: 8px"
                        />
                    </template>
                </Column>
                <Column header="Action">
                    <template #body="{ data }">
                        <Button
                            v-if="
                                !(data.payment_amount > 0) &&
                                data.status !== 'Closed' &&
                                data.status !== 'Reserved' &&
                                !data.time_ended &&
                                data.payment_method === 'cod'
                            "
                            icon="pi pi-money-bill"
                            label="Pay"
                            rounded
                            severity="secondary"
                            @click="PayBookingModalRef.toggleModal(data)"
                        />
                        <Button
                            v-if="!(data.payment_amount > 0) && data.status !== 'Closed' && data.status !== 'Done'"
                            icon="pi pi-money-bill"
                            label="Cancel Booking"
                            rounded
                            severity="danger"
                            class="mt-2"
                            @click="cancelBooking(data)"
                        />
                    </template>
                </Column>
            </DataTable>
            <div v-else class="pt-5">
                <div class="card" v-for="book in bookLists">
                    <div>Date Created: {{ new Date(book.created_at).toLocaleString() }}</div>
                    <div>
                        <div>
                            Area: <b>{{ book.parking_slot.area }}, {{ book.parking_slot.street }}</b>
                        </div>
                        <div>
                            LatLng: <b>{{ book.parking_slot.latitude }} - {{ book.parking_slot.longitude }}</b>
                        </div>
                    </div>
                    <div>Status: <Badge :severity="badgeTypeStatus(book.status)" :value="book.status"></Badge></div>
                    <div>Time Started: {{ dayjs(book.time_started).format("YYYY-MM-DD hh:mm a") }}</div>
                    <div>
                        Time Ended: {{ book.time_ended ? dayjs(book.time_ended).format("YYYY-MM-DD hh:mm a") : "--" }}
                    </div>
                    <div>
                        Amount:
                        <b>{{ book.payment_amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" }) }}</b>
                    </div>
                    <div>
                        Payment Method: <Badge v-if="book.payment_method === 'cod'">Cash On Hand</Badge>
                        <img
                            v-else-if="book.payment_method === 'gcash'"
                            :src="GCashLogo"
                            alt=""
                            class="bg-white p-1"
                            width="60"
                            style="border-radius: 8px"
                        />
                        <img
                            v-else-if="book.payment_method === 'maya'"
                            src="https://www.rankthemag.ph/wp-content/uploads/2022/05/Maya2-700x283.jpg"
                            alt=""
                            class="bg-white p-1"
                            width="60"
                            style="border-radius: 8px"
                        />
                    </div>
                    <Button
                        v-if="
                            !(book.payment_amount && book.payment_amount > 0) &&
                            book.status !== 'Closed' &&
                            !book.time_ended
                        "
                        icon="pi pi-money-bill"
                        label="Pay"
                        rounded
                        severity="secondary"
                        @click="PayBookingModalRef.toggleModal(book)"
                    />
                    <Button
                        v-if="
                            !(book.payment_amount && book.payment_amount > 0) &&
                            book.status !== 'Closed' &&
                            book.status !== 'Done'
                        "
                        icon="pi pi-money-bill"
                        label="Cancel Booking"
                        rounded
                        severity="danger"
                        class="mt-2"
                        @click="cancelBooking(book)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
