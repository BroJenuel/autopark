<script setup>
import { ref } from "vue";
import { supabaseClient } from "@/service/supabase/supabase";
import { useToast } from "primevue/usetoast";
import { Loading } from "notiflix";
import Payment from "@/components/PaymentSimulation/Payment.vue";

const PaymentRef = ref(null);
const toast = useToast();
const showModal = ref(false);
const showConfirmModal = ref(false);
const slotDetails = ref(null);
const selectedPaymentMethod = ref(null);
const paymentMethodData = ref(null);

function toggleModal(data) {
    slotDetails.value = data;
    showModal.value = !showModal.value;
}

async function bookSlot() {
    const parkingSlotId = slotDetails.value.id;
    const timeStarted = new Date();

    Loading.hourglass("booking slot...");

    const { data, error } = await supabaseClient
        .from("parking_slot_booking")
        .insert([
            {
                parking_slot_id: parkingSlotId,
                time_started: timeStarted,
                payment_method: selectedPaymentMethod.value,
                payment_method_details: paymentMethodData.value
            }
        ]);

    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    toast.add({
        severity: "success",
        summary: `Success Booked Slot - ${slotDetails.area}, ${slotDetails.street}`,
        detail: "Slot booked",
        life: 6000
    });

    showModal.value = false;
    showConfirmModal.value = false;
    emit("booked", slotDetails.value);

    // redirect to my booking
}

const emit = defineEmits(["booked"]);

defineExpose({
    toggleModal
});

</script>

<template>
    <Payment ref="PaymentRef" @pay="(paymentData) => {
        paymentMethodData = paymentData;
        bookSlot();
    }" />
    <Dialog v-model:visible="showModal" :style="{ width: '50rem', margin: '0 10px' }" header="Occupy Slot?" modal>
        <div v-if="slotDetails" class="mb-5">
            <div
                v-for="(value, key) in Object.fromEntries(Object.entries(slotDetails).filter(([key, value]) => !['id','created_at'].includes(key)))">
                <p>{{ key }}: <b>{{ value }}</b></p>
            </div>
        </div>
        <div class="flex flex-column gap-3">
            <Button label="Yes" @click="showConfirmModal = true" />
            <Button label="Close" severity="secondary" @click="showModal = false" />
        </div>
    </Dialog>
    <Dialog v-model:visible="showConfirmModal" :style="{ width: '40rem', margin: '0 10px' }"
            header="Choose Payment Method"
            modal>

        <div class="flex flex-column gap-3 mt-5">
            <p class="m-0">Occupy Easily With Online Pay</p>
            <Button label="GCash" severity="info"
                    @click="selectedPaymentMethod = 'gcash'; PaymentRef.toggleDialog('gcash')" />
            <Button label="Maya" severity="success"
                    @click="selectedPaymentMethod = 'maya'; PaymentRef.toggleDialog('maya')" />
        </div>
        <div class="flex flex-column gap-3 mt-5">
            <p class="m-0">When using Cash, you are givin 15 minute time limit to arrive at the slot. The slot will be
                open after 15 minutes.</p>
            <Button label="Cash On Hand" @click="selectedPaymentMethod = 'cod'; PaymentRef.toggleDialog('cod')" />
        </div>
    </Dialog>
</template>

<style lang="scss" scoped>

</style>