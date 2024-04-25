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
const parkingSlotId = ref(null);

const driverDetails = ref({
    name: "",
    driver_license: "",
    driver_license_expiration: "",
});

async function toggleModal(parking_slot_id) {
    parkingSlotId.value = parking_slot_id;
    Loading.standard("Loading...");
    const { data, error } = await getOccupiedTheSlot(parking_slot_id);
    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    if (data[0].user_profile) {
        driverDetails.value.name = data[0].user_profile.data.first_name + " " + data[0].user_profile.data.last_name;
        driverDetails.value.driver_license = data[0].user_profile.data.driver_license;
        driverDetails.value.driver_license_expiration = dayjs(data[0].user_profile.data.driver_license_expiration).format(
            "MMMM D, YYYY",
        );
    } else if (data[0].unregistered_user_details) {
        const parsedData = JSON.parse(data[0].unregistered_user_details);
        driverDetails.value.name = "Unregistered User";
        driverDetails.value.driver_license = parsedData.driver_license;
        driverDetails.value.driver_license_expiration = dayjs(parsedData.driver_license_expiration).format(
            "MMMM D, YYYY",
        );
    }

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

async function handleMarkAsAvailable() {
    try {
        Loading.standard(`Marking parking slot as "Available"`);
        await markAsAvailable(parkingSlotId.value);
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
        <div>
            <div>Name: {{ driverDetails.name }}</div>
            <div>
                Driver License:
                <span style="text-transform: uppercase">{{ driverDetails.driver_license }}</span>
            </div>
            <div>
                Driver License Exp:
                {{ driverDetails.driver_license_expiration }}
            </div>

            <Button :style="{ marginTop: '1rem' }" severity="info" @click="handleMarkAsAvailable">
                Mark as Available
            </Button>
        </div>
    </Dialog>
</template>
