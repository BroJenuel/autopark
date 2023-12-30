<script setup>
import { supabaseClient } from '@/service/supabase/supabase';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { Loading } from 'notiflix';

const toast = useToast();
const events = ref([]);

async function getEvents() {
    Loading.standard();
    const data = await supabaseClient
        .from('events_announcements')
        .select()
        .eq('type', 'event')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    Loading.remove();

    if (data.error) {
        toast.add({ severity: 'error', summary: 'Error', detail: data.error.message });
        return;
    }

    events.value = data.data;

}

onMounted(() => {
    getEvents();
});
</script>

<template>
    <div class="card">
        <div class="flex justify-content-between align-items-center">
            <h3><span class="pi pi-fw pi-calendar" style="font-size: 1.5rem"></span> EVENTS</h3>
        </div>
        <div class="flex gap-3">
            <Card v-for="event in events" :key="event.id" style="width: 25em; overflow: hidden">
                <template #header>
                    <div class="flex justify-content-center" style="overflow: hidden;">
                        <Image
                            :src="event.image ? `https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${event.image.data.fullPath}` : `https://logos.flamingtext.com/Word-Logos/event-design-sketch-name.png`"
                            alt="user header" height="180" preview width="350" />
                    </div>
                </template>
                <template #title> {{ event.title }}</template>
                <template #subtitle> Card subtitle</template>
                <template #content>
                    <p class="m-0" v-html="event.description.replace(/\n/g, '<br>')">
                    </p>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>