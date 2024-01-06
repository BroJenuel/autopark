<script setup>
import { ref } from 'vue';
import { supabaseClient, supabaseSecretClient } from '@/service/supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { Loading } from 'notiflix';

const toast = useToast();
const showModal = ref(false);
const showConfirmModal = ref(false);
const slotDetails = ref(null);

function toggleModal(data) {
    slotDetails.value = data;
    showModal.value = !showModal.value;
}

async function bookSlot() {
    const parkingSlotId = slotDetails.value.id;
    const timeStarted = new Date();

    Loading.hourglass('booking slot...');

    const { data, error } = await supabaseClient
        .from('parking_slot_booking')
        .insert([
            { parking_slot_id: parkingSlotId, time_started: timeStarted }
        ]);

    Loading.remove();

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 6000 });
        return;
    }

    toast.add({
        severity: 'success',
        summary: `Success Booked Slot - ${slotDetails.area}, ${slotDetails.street}`,
        detail: 'Slot booked',
        life: 6000
    });

    showModal.value = false;
    showConfirmModal.value = false;
    emit('booked', slotDetails.value);
}

const emit = defineEmits(['booked'])

defineExpose({
    toggleModal
});

</script>

<template>
    <Dialog v-model:visible="showModal" :style="{ width: '50rem', margin: '0 10px' }" header="Book Slot" modal>
        <div v-if="slotDetails" class="mb-5">
            <div
                v-for="(value, key) in Object.fromEntries(Object.entries(slotDetails).filter(([key, value]) => !['id','created_at'].includes(key)))">
                <p>{{ key }}: <b>{{ value }}</b></p>
            </div>
        </div>
        <div class="flex flex-column gap-3">
            <Button label="Book" @click="showConfirmModal = true" />
            <Button label="Close" severity="secondary" @click="showModal = false" />
        </div>
    </Dialog>
    <Dialog v-model:visible="showConfirmModal" modal :style="{ width: '40rem', margin: '0 10px' }">
        <h4>Are you sure to book {{ slotDetails.area ?? '' }}, {{ slotDetails.street ?? '' }}?</h4>
        <div>lat: {{  slotDetails.latitude ?? '' }}</div>
        <div>lng: {{  slotDetails.longitude ?? ''}}</div>
        <div class="flex flex-column gap-3 mt-5">
            <Button label="Book" @click="bookSlot" />
            <Button label="Cancel" severity="secondary" @click="showConfirmModal = false" />
        </div>
    </Dialog>
</template>

<style lang="scss" scoped>

</style>