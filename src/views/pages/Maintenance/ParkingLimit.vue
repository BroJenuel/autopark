<script setup>
import { log } from "@/service/supabase/supabase";
import { fetchParkingLimit, updateParkingLimit } from "@/service/supabase/table/parking_limit";
import dayjs from "dayjs";
import customParseFormat from "dayjs/esm/plugin/customParseFormat";
import { Loading } from "notiflix";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";

dayjs.extend(customParseFormat);

const oldData = ref(null);
const toast = useToast();
const form = ref({
    parking_limit: 3,
});

async function save() {
    try {
        Loading.standard("Saving setting...");
        await updateParkingLimit(form.value.parking_limit);
        await log.createLog("maintenance", "update", form.value, oldData.value);
        oldData.value = JSON.parse(JSON.stringify(form.value));
        toast.add({ severity: "success", summary: "Success", detail: "Settings saved", life: 2500 });
    } catch (e) {
        toast.add({ severity: "error", summary: "Error", detail: e.message ?? "Unable to save settings", life: 10000 });
    } finally {
        Loading.remove();
    }
}

async function getParkingLimit() {
    Loading.standard("Fetching data...");

    const data = await fetchParkingLimit();

    Loading.remove();

    form.value.parking_limit = data.parking_limit;
    oldData.value = JSON.parse(JSON.stringify(data));
}

onMounted(() => {
    getParkingLimit();
});
</script>

<template>
    <div id="rates-card" class="card flex flex-column gap-4">
        <div class="flex justify-content-between align-items-center">
            <h3>Parking Limit</h3>
        </div>

        <form @submit.prevent="save">
            <div class="flex flex-column w-26rem">
                <div class="flex flex-row items-center gap-2 mb-3 w-full">
                    <InputNumber v-model="form.parking_limit" variant="outlined" showButtons :min="0" :max="23">
                    </InputNumber>

                    <span>hour/s</span>
                </div>
            </div>
            <div class="flex justify-content-end">
                <Button type="submit" label="Save"></Button>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped></style>
