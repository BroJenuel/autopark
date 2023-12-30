<script setup>
import { ref } from 'vue';
import { createParkingSlot, updateParkingSlot } from '@/service/supabase/table/parking_slot';
import { Loading } from 'notiflix';
import { removeEmpty } from '@/utils/objects';

const emits = defineEmits(['stored']);
const showModal = ref(false);
const form = ref({
    id: null,
    area: null,
    street: null,
    latitude: null,
    longitude: null,
    status: 'available'
});

const statusOptions = [
    { name: 'Available', code: 'available' },
    { name: 'Occupied', code: 'occupied' },
    { name: 'Not Available', code: 'not_available' }
];

const streets = ref([
    { name: 'Harrison Road', code: 'Harrison Road' },
    { name: 'Kamog', code: 'Kamog' },
    { name: 'Session Road', code: 'Session Road' },
    { name: 'Session Road Up', code: 'Session Road Up' },
    { name: 'Upper Session Road', code: 'Upper Session Road' }
]);

function toggleModal(data = {
    id: null,
    area: null,
    street: null,
    latitude: null,
    longitude: null,
    status: 'available'
}) {
    if (data != null) form.value = data;
    showModal.value = !showModal.value;
}


async function submit() {
    const isUpdate = form.value.id != null;

    const params = removeEmpty(form.value);
    console.log(form.value);

    Loading.standard(form.value.id ? 'Updating Parking Slot' : 'Adding New Parking Slot');

    let parkingSlot;

    if (!isUpdate) parkingSlot = await createParkingSlot(params);
    else parkingSlot = await updateParkingSlot(params);

    emits('stored', parkingSlot);
    Loading.remove();
    toggleModal();
}

defineExpose({
    toggleModal
});
</script>

<template>
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
                <label>Street</label>
                <Dropdown
                    v-model="form.street"
                    :options="streets"
                    class="w-full md:w-14rem"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select a City"
                    required
                />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Latitude</label>
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