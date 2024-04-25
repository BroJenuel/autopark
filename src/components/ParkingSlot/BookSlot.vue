<script setup>
import Payment from "@/components/PaymentSimulation/Payment.vue";
import { checkIfHasExistingBooking } from "@/service/supabase/table/parking_slot_booking";
import { supabaseClient } from "@/service/supabase/supabase";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

const PaymentRef = ref(null);
const toast = useToast();
const showModal = ref(false);
const showConfirmModal = ref(false);
const hoursToOccupy = ref(null);
const slotDetails = ref(null);
const selectedPaymentMethod = ref(null);
const paymentMethodData = ref(null);

function toggleModal(data) {
    slotDetails.value = data;
    showModal.value = !showModal.value;
}

/**
 * Get rates from settings
 *
 * @returns {Promise<number>}
 */
async function getPaymentAmount() {
    const { data, error } = await supabaseClient.from("settings").select().eq("id", 1);
    if (error || data.length === 0) {
        throw new Error(error);
    }

    if (hoursToOccupy.value === 2) {
        return data[0].first_two_hours;
    }

    return data[0].first_two_hours + data[0].exceed_rate_per_hour;
}

async function bookSlot() {
    Loading.standard("Checking for existing booking...");

    const hasExistingBooking = await checkIfHasExistingBooking();
    if (hasExistingBooking) {
        Loading.remove();
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "You have an existing booking. Please cancel it first before booking another slot.",
            life: 6000,
        });
        return;
    }
    Loading.remove();

    Loading.standard("Booking slot...");

    const parkingSlotId = slotDetails.value.id;
    const timeStarted = new Date();

    /** @type {number} */
    let payment_amount = 0;
    /** @type {Date | null} */
    let paid_at = null;
    /** @type {number | null} */
    let reserved_hours = null;

    if (selectedPaymentMethod.value === "gcash" || selectedPaymentMethod.value === "maya") {
        payment_amount = await getPaymentAmount();
        paid_at = new Date();
    }
    if (selectedPaymentMethod.value === "cod") {
        reserved_hours = hoursToOccupy.value;
    }

    const { error } = await supabaseClient.from("parking_slot_booking").insert([
        {
            parking_slot_id: parkingSlotId,
            time_started: timeStarted,
            payment_method: selectedPaymentMethod.value,
            payment_method_details: paymentMethodData.value,
            payment_amount,
            paid_at,
            reserved_hours,
        },
    ]);

    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    toast.add({
        severity: "success",
        summary: `Success Booked Slot - ${slotDetails.value.area}, ${slotDetails.value.street}`,
        detail: "Slot booked",
        life: 6000,
    });

    showModal.value = false;
    showConfirmModal.value = false;
    emit("booked", slotDetails.value);

    // redirect to my booking
}

const handle2Hours = () => {
    showConfirmModal.value = true;
    hoursToOccupy.value = 2;
};

const handle3Hours = () => {
    showConfirmModal.value = true;
    hoursToOccupy.value = 3;
};

const emit = defineEmits(["booked"]);

defineExpose({
    toggleModal,
});
</script>

<template>
    <Payment
        ref="PaymentRef"
        @pay="
            (paymentData) => {
                paymentMethodData = paymentData;
                bookSlot();
            }
        "
    />
    <Dialog v-model:visible="showModal" :style="{ width: '50rem', margin: '0 10px' }" header="Occupy Slot?" modal>
        <div v-if="slotDetails" class="mb-5">
            <div
                v-for="(value, key) in Object.fromEntries(
                    Object.entries(slotDetails).filter(([key, value]) => !['id', 'created_at'].includes(key)),
                )"
            >
                <p>
                    {{ key }}: <b>{{ value }}</b>
                </p>
            </div>
        </div>
        <div class="flex flex-column gap-3">
            <Button label="Occupy for 2 hours" @click="handle2Hours" />
            <Button label="Occupy for 3 hours" @click="handle3Hours" />
            <Button label="Close" severity="secondary" @click="showModal = false" />
        </div>
    </Dialog>
    <Dialog
        v-model:visible="showConfirmModal"
        :style="{ width: '40rem', margin: '0 10px' }"
        header="Choose Payment Method"
        modal
    >
        <div class="flex flex-column gap-3 mt-5">
            <p class="m-0">Occupy Easily With Online Pay</p>
            <Button
                label="GCash"
                severity="info"
                @click="
                    selectedPaymentMethod = 'gcash';
                    PaymentRef.toggleDialog('gcash');
                "
            />
            <Button
                label="Maya"
                severity="success"
                @click="
                    selectedPaymentMethod = 'maya';
                    PaymentRef.toggleDialog('maya');
                "
            />
        </div>
        <div class="flex flex-column gap-3 mt-5">
            <p class="m-0">
                When using Cash, you are givin 15 minute time limit to arrive at the slot. The slot will be open after
                15 minutes.
            </p>
            <Button
                label="Cash On Hand"
                @click="
                    selectedPaymentMethod = 'cod';
                    PaymentRef.toggleDialog('cod');
                "
            />
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
