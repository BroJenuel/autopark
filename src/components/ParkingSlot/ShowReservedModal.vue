<script setup>
import { ref } from "vue";
import { supabaseClient } from "@/service/supabase/supabase";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";

const parkingSlotReserved = ref(null);
const toast = useToast();
const visible = ref(false);
const emits = defineEmits(["reloadParkingSlots"]);
async function toggleModal(parking_slot_id) {
    const { data, error } = await getParkingSlot(parking_slot_id);

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    parkingSlotReserved.value = data[0];
    console.log("test", parkingSlotReserved.value);

    visible.value = !visible.value;
}

async function handleMarkAsPaid() {
    // Start a transaction
    Loading.standard(`Marking parking slot as "Paid"`);

    const { error } = await supabaseClient.rpc("mark_as_paid", {
        parking_slot_id_update: parkingSlotReserved.value.parking_slot_id,
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
        .limit(1);
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

            <Button :style="{ marginTop: '1rem' }" @click="handleMarkAsPaid">Marked as Paid</Button>
        </div>
    </Dialog>
</template>
