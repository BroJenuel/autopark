<script setup>
import { onMounted, ref } from "vue";
import { Loading } from "notiflix";
import { log, supabaseClient } from "@/service/supabase/supabase";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";
import customParseFormat from "dayjs/esm/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const oldData = ref(null);
const toast = useToast();
const form = ref({
    id: 1,
    from: null,
    to: null,
    created_at: null,
});
const customTimeFormat = "HH:mm:ssZ";

async function save() {
    Loading.standard("Saving setting...");

    const { error } = await supabaseClient.from("parking_hours").upsert(convertFormDataToSupabaseFormat());

    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 10000 });
        return;
    }

    await log.createLog("maintenance", "update", form.value, oldData.value);
    oldData.value = JSON.parse(JSON.stringify(form.value));

    toast.add({ severity: "success", summary: "Success", detail: "Settings saved", life: 2500 });
}

async function getParkingHours() {
    Loading.standard("Fetching data...");

    const { data, error } = await supabaseClient.from("parking_hours").select().eq("id", 1).limit(1).single();

    Loading.remove();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 2000 });
        return;
    }

    form.value = reduceParkingHours(data);
    oldData.value = JSON.parse(JSON.stringify(data));
}

/**
 * Reduces the parking hours data.
 * @param {{ from: string, to: string }} data - The parking hours data.
 * @returns {{ from: Date, to: Date }}
 */
function reduceParkingHours(data) {
    return {
        from: dayjs(data.from, customTimeFormat).toDate(),
        to: dayjs(data.to, customTimeFormat).toDate(),
    };
}

function convertFormDataToSupabaseFormat() {
    return {
        id: 1,
        from: dayjs(form.value.from).format(customTimeFormat),
        to: dayjs(form.value.to).format(customTimeFormat),
    };
}

onMounted(() => {
    getParkingHours();
});
</script>

<template>
    <div id="rates-card" class="card flex flex-column gap-4">
        <div class="flex justify-content-between align-items-center">
            <h3>Parking Hours</h3>
        </div>

        <form @submit.prevent="save">
            <div class="flex flex-column w-26rem">
                <div class="flex flex-column gap-2 mb-3 w-full">
                    <label>From:</label>
                    <Calendar id="parkingHours.from" timeOnly v-model="form.from" hourFormat="12" />
                </div>
                <div class="flex flex-column gap-2 mb-3 w-full">
                    <label>To:</label>
                    <Calendar id="parkingHours.to" timeOnly v-model="form.to" hourFormat="12" :minDate="form.from" />
                </div>
            </div>
            <div class="flex justify-content-end">
                <Button type="submit" label="Save"></Button>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped></style>
