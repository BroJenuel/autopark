<script setup>
import { supabaseClient } from "@/service/supabase/supabase";
import { fetchParkingLimit } from "@/service/supabase/table/parking_limit";
import { updateParkingSlotStatus } from "@/service/supabase/table/parking_slot";
import dayjs from "dayjs";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

const parkingSlotOccupied = ref(null);
const toast = useToast();
const visible = ref(false);
const emits = defineEmits(["reloadParkingSlots"]);
const parkingLimit = ref(3);
const parkingRates = ref({
    first_two_hours: 50,
    exceed_rate_per_hour: 30,
});

const form = ref({
    driver_license: null,
    driver_license_expiration: null,
    hours: null,
});

async function toggleModal(parking_slot_id) {
    parkingSlotOccupied.value = parking_slot_id;
    Loading.standard("Loading...");
    await initializeData();
    Loading.remove();
    visible.value = !visible.value;
}

async function initializeData() {
    try {
        const parkingLimitResponse = await fetchParkingLimit();
        const { data: parkingRatesResponse } = await supabaseClient
            .from("settings")
            .select("*")
            .eq("id", 1)
            .limit(1)
            .single()
            .throwOnError();

        parkingLimit.value = parkingLimitResponse.parking_limit;
        parkingRates.value.first_two_hours = parkingRatesResponse.first_two_hours;
        parkingRates.value.exceed_rate_per_hour = parkingRatesResponse.exceed_rate_per_hour;
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: e.message ?? "Unable to fetch settings",
            life: 3000,
        });
    }
}

function calculateAmount(hours) {
    const { first_two_hours, exceed_rate_per_hour } = parkingRates.value;
    const exceedHours = hours - 2;
    const exceedAmount = exceedHours > 0 ? exceedHours * exceed_rate_per_hour : 0;

    return first_two_hours + exceedAmount;
}

function validateForm() {
    if (!form.value.driver_license) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Driver license is required",
            life: 3000,
        });
        return false;
    }

    if (!form.value.driver_license_expiration) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Driver license expiration is required",
            life: 3000,
        });
        return false;
    }

    if (!form.value.hours) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Hours is required",
            life: 3000,
        });
        return false;
    }

    if (form.value.hours > parkingLimit.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: `Parking limit exceeded. Maximum of ${parkingLimit.value} hours only.`,
            life: 3000,
        });
        return false;
    }

    return true;
}

async function handleMarkAsOccupied() {
    if (!validateForm()) {
        return;
    }
    console.log("test", { parkingSlotOccupied });
    if (!parkingSlotOccupied.value) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Parking slot is required",
            life: 3000,
        });
        return;
    }

    try {
        Loading.standard(`Marking  parking slot as "Available"`);

        // Create a parking slot booking using the user_id and parking_slot_id
        await supabaseClient
            .from("parking_slot_booking")
            .insert({
                created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                paid_at: new Date(),
                parking_slot_id: parkingSlotOccupied.value,
                payment_amount: calculateAmount(form.value.hours),
                payment_method: "cod",
                time_started: new Date(),
                user_id: null,
                unregistered_user_details: JSON.stringify({
                    driver_license: form.value.driver_license,
                    driver_license_expiration: form.value.driver_license_expiration,
                }),
            })
            .throwOnError();

        // Set the parking slot as "Occupied"
        await updateParkingSlotStatus([parkingSlotOccupied.value], "occupied").throwOnError();

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
    <Dialog v-model:visible="visible" modal header="Mark as Occupied" :style="{ width: '25rem' }">
        <form @submit.prevent="handleMarkAsOccupied">
            <h3 class="mb-2">Drivers License</h3>
            <div class="flex flex-column mt-5 gap-2">
                <div class="flex flex-column gap-2">
                    <label>License #</label>
                    <InputText
                        v-model="form.driver_license"
                        class="uppercase"
                        placeholder="NEQ5505 (Without Dash)"
                        required
                    />
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>License Expiration</label>
                    <Calendar
                        v-model="form.driver_license_expiration"
                        :minDate="licenseExpirationMinDate"
                        placeholder="Select Driver license expiration"
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Hour(s)</label>
                    <InputNumber v-model="form.hours" suffix="hour(s)" required />
                </div>
            </div>
            <Button :style="{ marginTop: '1rem' }" severity="primary" type="submit"> Mark as Occupied </Button>
        </form>
    </Dialog>
</template>
