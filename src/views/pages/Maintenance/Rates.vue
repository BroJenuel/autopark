<script setup>
import { onMounted, ref } from 'vue';
import { Loading } from 'notiflix';
import { supabaseClient } from '@/service/supabase/supabase';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const form = ref({
    id: 1,
    first_two_hours: 0,
    exceed_rate_per_hour: 0,
    created_at: null
});

async function save() {
    Loading.standard('saving setting...');

    const { error } = await supabaseClient
        .from('settings')
        .upsert(JSON.parse(JSON.stringify(form.value)))

    Loading.remove();

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 10000 });
        return
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Settings saved', life: 2500 });
}

async function getSetting() {

    Loading.standard( 'getting settings...');

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

    form.value = data;
}

onMounted(() => {
    getSetting();
})

</script>

<template>
    <div id="rates-card" class="card">
        <div class="flex justify-content-between align-items-center">
            <h3><span class="pi pi-fw pi-dollar" style="font-size: 1.5rem"></span> Rates</h3>
        </div>
        <form @submit.prevent="save">
            <div class="flex flex-column gap-3 w-26rem">
                <div class="flex flex-column gap-2 mb-3 w-full">
                    <label>First 2 Hours</label>
                    <InputNumber v-model="form.first_two_hours" currency="PHP" locale="en-PH" mode="currency" />
                </div>
                <div class="flex flex-column gap-2 mb-3 w-full">
                    <label>Exceed Rate Per Hour</label>
                    <InputNumber v-model="form.exceed_rate_per_hour" currency="PHP" locale="en-PH" mode="currency" />
                </div>
            </div>
            <div class="flex justify-content-end">
                <Button type="submit" label="Save"></Button>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>

</style>