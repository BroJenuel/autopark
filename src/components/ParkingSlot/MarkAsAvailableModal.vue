<script setup>
import { supabaseClient } from "@/service/supabase/supabase";
import { updateParkingSlotStatus } from "@/service/supabase/table/parking_slot";
import { markAsAvailable } from "@/service/supabase/table/parking_slot_booking";
import dayjs from "dayjs";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

const parkingSlotOccupied = ref(null);
const toast = useToast();
const visible = ref(false);
const emits = defineEmits(["reloadParkingSlots"]);

async function toggleModal(parking_slot_id) {
    const { data, error } = await getOccupiedTheSlot(parking_slot_id);

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    parkingSlotOccupied.value = data[0];

    visible.value = !visible.value;
}

async function getOccupiedTheSlot(parking_slot_id) {
    return supabaseClient
        .from("parking_slot_booking")
        .select("*, user_profile(*)")
        .eq("parking_slot_id", parking_slot_id)
        .filter("time_ended", "is", null)
        .order("id", { ascending: false })
        .limit(1);
}

async function handleMarkAsPaid() {
    try {
        Loading.standard(`Marking parking slot as "Available"`);
        await markAsAvailable(parkingSlotOccupied.value.parking_slot_id);
        emits("reloadParkingSlots");
        visible.value = false;
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: e.message ?? 'Unable to mark the parking slot as "Paid"',
            life: 3000,
        });
    } finally {
        Loading.remove();
    }
}

defineExpose({
    toggleModal,
});
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Occupied by" :style="{ width: '25rem' }">
        <div v-if="parkingSlotOccupied && parkingSlotOccupied.user_profile && parkingSlotOccupied.user_profile.data">
            <div>
                Name: {{ parkingSlotOccupied.user_profile.data.first_name }}
                {{ parkingSlotOccupied.user_profile.data.last_name }}
            </div>
            <div>Email: {{ parkingSlotOccupied.user_profile.data.email }}</div>
            <div>
                Driver License:
                <span style="text-transform: uppercase">{{
                    parkingSlotOccupied.user_profile.data.driver_license
                }}</span>
            </div>
            <div>
                Driver License Exp:
                {{ dayjs(parkingSlotOccupied.user_profile.data.driver_license_expiration).format("MMMM D, YYYY") }}
            </div>

            <Button :style="{ marginTop: '1rem' }" severity="info" @click="handleMarkAsPaid">Mark as Available</Button>
        </div>
    </Dialog>
</template>
