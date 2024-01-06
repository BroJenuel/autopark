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
        .eq('type', 'announcement')
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
            <h3><span class="pi pi-fw pi-bell" style="font-size: 1.5rem"></span> ANNOUNCEMENTS</h3>
        </div>
        <div class="flex gap-3 flex-column md:flex-row flex-wrap">
            <Card v-for="event in events" :key="event.id" style="width: 100%; max-width: 25em; overflow: hidden">
                <template #header>
                    <div class="flex justify-content-center" style="overflow: hidden;">
                        <Image
                            :src="event.image ? `https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${event.image.data.fullPath}` : `https://i.pinimg.com/originals/1f/60/62/1f6062bf20e210bfc3b30cf53b7df6dc.jpg`"
                            alt="user header" preview width="350" height="180" />
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