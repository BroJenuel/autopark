<script setup>
import { ref } from "vue";
import { createParkingSlot, updateParkingSlot } from "@/service/supabase/table/parking_slot";
import { Loading } from "notiflix";
import { removeEmpty } from "@/utils/objects";
import { log, supabaseClient } from "@/service/supabase/supabase";
import { useToast } from "primevue/usetoast";
import { useUserStore } from "@/store/userStore";
import GetLatAndLongInMap from "@/components/ParkingSlot/GetLatAndLongInMap.vue";

const oldData = ref(null);
const GetLatAndLongInMapRef = ref();
const userStore = useUserStore();
const toast = useToast();
const emits = defineEmits(["stored"]);
const showModal = ref(false);
const form = ref({
    id: null,
    area: null,
    street: null,
    latitude: null,
    longitude: null,
    status: "available",
});

const statusOptions = [
    { name: "Available", code: "available" },
    { name: "Occupied", code: "occupied" },
    { name: "Not Available", code: "not_available" },
    { name: "Reserved", code: "reserved" },
];

const streetOptionLoading = ref(false);
const streets = ref([]);

async function getStreets() {
    streetOptionLoading.value = true;
    const { data, error } = await supabaseClient.from("streets").select();

    streetOptionLoading.value = false;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
        return;
    }

    streets.value = data.map((d) => ({ name: d.name, code: d.name }));
}

function toggleModal(
    data = {
        id: null,
        area: null,
        street: null,
        latitude: null,
        longitude: null,
        status: "available",
    },
) {
    if (data != null) {
        form.value = data;
        oldData.value = JSON.parse(JSON.stringify(data));
    }
    showModal.value = !showModal.value;
    getStreets();
}

async function submit() {
    const isUpdate = form.value.id != null;

    const params = removeEmpty(form.value);

    Loading.standard(form.value.id ? "Updating Parking Slot" : "Adding New Parking Slot");

    let parkingSlot;

    if (!isUpdate) parkingSlot = await createParkingSlot(params);
    else parkingSlot = await updateParkingSlot(params);

    if (parkingSlot.error) {
        toast.add({ severity: "error", summary: "Error", detail: parkingSlot.error.message, life: 3000 });
        Loading.remove();
        return;
    }

    await log.createLog("parking", isUpdate ? "update" : "create", params, oldData.value);

    emits("stored", parkingSlot);
    Loading.remove();
    toggleModal();
}

defineExpose({
    toggleModal,
});
</script>

<template>
    <GetLatAndLongInMap
        ref="GetLatAndLongInMapRef"
        @selected="({ latitude, longitude }) => ((form.latitude = latitude), (form.longitude = longitude))"
    />
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :header="form.id ? 'Update Parking Slot' : 'Add New Parking Slot'"
        :style="{ width: '50rem' }"
        modal
    >
        <form @submit.prevent="submit">
            <div class="flex flex-column gap-2 mb-3">
                <label>Area</label>
                <InputText v-model="form.area" placeholder="ex. example@gmail.com" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label
                    >Street
                    <RouterLink v-if="userStore.role === 'admin'" class="text-blue-500" to="/maintenance/street"
                        >Manage Streets
                    </RouterLink>
                </label>
                <Dropdown
                    v-model="form.street"
                    :loading="streetOptionLoading"
                    :options="streets"
                    class="w-full md:w-14rem"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select street"
                    required
                />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>
                    Latitude
                    <Button
                        class="py-0 px-1"
                        label="Set Lat & Long"
                        size="small"
                        @click="GetLatAndLongInMapRef.toggleModal(form.latitude, form.longitude)"
                    />
                </label>
                <InputText v-model="form.latitude" placeholder="ex. 16.411697048290645" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Longitude</label>
                <InputText v-model="form.longitude" placeholder="ex. 120.59863785911365" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Status</label>
                <Dropdown
                    v-model="form.status"
                    :options="statusOptions"
                    class="w-full md:w-14rem"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select Status"
                    required
                />
            </div>
            <Button :label="form.id ? 'Update Parking Slot' : 'Create Parking Slot'" type="submit" />
        </form>
    </Dialog>
</template>
