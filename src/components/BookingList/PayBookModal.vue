<script setup>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import { Loading } from 'notiflix';
import { supabaseClient } from '@/service/supabase/supabase';
import GCashLogo from '@/assets/images/gcash logo.png';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const showModal = ref(false);
const bookingData = ref(null);
const rating = ref(null);

async function toggleModal(arg) {

    bookingData.value = arg;
    await getRating();
    showModal.value = !showModal.value;
}

async function getRating() {
    Loading.standard('getting settings...');

    const { data, error } = await supabaseClient
        .from('settings')
        .select()
        .eq('id', 1)
        .limit(1)
        .single();

    Loading.remove();

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 2000 });
        return;
    }

    rating.value = data;
}

const hours = computed(() => {
    const timeStarted = bookingData.value?.time_started;
    // if (!timeStarted) return 0;
    // const startDate = dayjs(timeStarted); // Replace with your actual starting date
    // const now = dayjs();
    //
    // return startDate.diff(now, 'hour') * -1; // to make it positive

    const startDate = dayjs(timeStarted); // Replace with your actual starting date
    const now = dayjs();

    const millisecondDiff = now.diff(startDate);
    const hoursDiff = millisecondDiff / (1000 * 60 * 60);
    return hoursDiff.toFixed(2);
});

const total = computed(() => {
    let total = 0;
    let hrs = hours.value;

    if (hrs > 2) {
        total += 50;
        hrs -= 2;
        total += hrs * (rating.value.exceed_rate_per_hour);
        return total;
    } else {
        return 50;
    }
});

const computation = computed(() => {
    let total = 0;
    let hrs = hours.value;
    let explanation = '';

    if (hrs > 2) {
        total += 50;
        explanation += `first 2 Hours is ${(50).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}.`;
        hrs -= 2;
        total += hrs * (rating.value.exceed_rate_per_hour);
        explanation += ` ${hrs} Exceeding Hours  is ${(hrs * (rating.value.exceed_rate_per_hour)).toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP'
        })}`; //'Exceeding Hours is ' + hrs + ' ' + (hrs * (rating.value.exceed_rate_per_hour));
        return explanation;
    } else {
        return 'First Two Hours is 50';
    }
});

async function submitPayment(paymentMethod) {
    if (!confirm('Are you sure you want to proceed payment? make sure you have available balance')) {
        toast.add({ severity: 'warn', summary: 'Cancelled.', detail: 'Transaction cancelled', life: 2000 });
        return;
    }

    const { data, error } = await supabaseClient
        .from('parking_slot_booking')
        .update({
            time_ended: new Date(),
            payment_amount: total.value,
            paid_at: new Date(),
            payment_method: paymentMethod
        })
        .eq('id', bookingData.value.id)
        .select();

    console.log(data, error);

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 2000 });
        return;
    }


    showModal.value = false;
    emit('paid', data);
}

const emit = defineEmits(['paid']);

defineExpose({
    toggleModal
});
</script>

<template>
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :style="{ width: '50rem' }"
        modal
        @hide="bookingData = null; rating = null"
    >
        <template #header>
            <h4 class="text-center w-full">
                Pay
            </h4>
        </template>
        <div v-if="bookingData && rating" class="text-center">
            <div>Time Started: <b>{{ dayjs(bookingData.time_started).format('YYYY-MM-DD hh:mm A') }}</b></div>
            <div>Hours Consumed: <b>{{ hours }}</b></div>

            <div class="mt-4">
                <div v-if="hours > 2">
                    {{ computation }}
                    <div><b>Total: {{ total.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }) }}</b></div>
                </div>
                <div v-else><b>Total: {{ total.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }) }}</b>
                </div>
            </div>
        </div>

        <div class="mt-5 flex flex-column gap-2 text-center">
            <Button :style="{ justifyContent: 'center'}" rounded @click="submitPayment('cod')"><span
                class="pi pi-money-bill mr-2 mt-1"></span> Cash
                On Hand
            </Button>
            <Button :style="{ justifyContent: 'center'}" rounded severity="info" @click="submitPayment('gcash')">
                <img :src="GCashLogo" alt="" width="80" />
            </Button>
        </div>
    </Dialog>
</template>