<script setup>
import { ref } from "vue";
import { supabaseClient } from "@/service/supabase/supabase";
import { fetchParkingRates } from "@/service/supabase/table/settings";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";

const parkingSlotReserved = ref(null);
const parkingRates = ref({
    first_two_hours: 50,
    exceed_rate_per_hour: 30,
});
const toast = useToast();
const visible = ref(false);
const emits = defineEmits(["reloadParkingSlots"]);

async function toggleModal(parking_slot_id) {
    try {
        Loading.standard();
        const { data } = await getParkingSlot(parking_slot_id);
        const { data: settings } = await fetchParkingRates();

        parkingSlotReserved.value = data;
        console.log("test", { data });
        parkingRates.value = settings;
        visible.value = !visible.value;
    } catch (e) {
        toast.add({ severity: "error", summary: "Error", detail: e.message, life: 6000 });
        return;
    } finally {
        Loading.remove();
    }
}

function calculatePaymentAmount(hoursOccupied) {
    return hoursOccupied <= 2
        ? parkingRates.value.first_two_hours
        : parkingRates.value.first_two_hours + (hoursOccupied - 2) * parkingRates.value.exceed_rate_per_hour;
}

async function handleMarkAsPaid() {
    // Start a transaction
    Loading.standard(`Marking parking slot as "Paid"`);

    const { error } = await supabaseClient.rpc("mark_as_paid_v2", {
        parking_slot_id_update: parkingSlotReserved.value.parking_slot_id,
        payment_amount_update: calculatePaymentAmount(parkingSlotReserved.value.reserved_hours ?? 2),
    });

    Loading.remove();

    if (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: 'Unable to mark the parking slot as "Paid"',
            life: 3000,
        });
        return;
    }

    toast.add({
        severity: "success",
        summary: "Success",
        detail: 'Parking slot has been marked as "Paid"',
        life: 3000,
    });

    emits("reloadParkingSlots");
    visible.value = false;
}

async function getParkingSlot(parking_slot_id) {
    return supabaseClient
        .from("parking_slot_booking")
        .select("*, user_profile(*)")
        .eq("parking_slot_id", parking_slot_id)
        .filter("time_ended", "is", null)
        .order("id", { ascending: false })
        .limit(1)
        .single()
        .throwOnError();
}

defineExpose({
    toggleModal,
});
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Reserved" :style="{ width: '25rem' }">
        <div v-if="parkingSlotReserved && parkingSlotReserved.user_profile && parkingSlotReserved.user_profile.data">
            <div>
                Name: {{ parkingSlotReserved.user_profile.data.first_name }}
                {{ parkingSlotReserved.user_profile.data.last_name }}
            </div>
            <div>Email: {{ parkingSlotReserved.user_profile.data.email }}</div>
            <div>
                Driver License:
                <span style="text-transform: uppercase">{{
                    parkingSlotReserved.user_profile.data.driver_license
                }}</span>
            </div>
            <div>
                Driver License Exp:
                {{ dayjs(parkingSlotReserved.user_profile.data.driver_license_expiration).format("MMMM D, YYYY") }}
            </div>

            <Button :style="{ marginTop: '1rem' }" @click="handleMarkAsPaid">Mark as Paid</Button>
        </div>
    </Dialog>
</template>
