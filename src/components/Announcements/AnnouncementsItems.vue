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

const showAnnouncementDialog = ref(false);
const dataShow = ref(null);

function showDataModal(data) {
    dataShow.value = data;
    showAnnouncementDialog.value = true;
}
</script>

<template>
    <Dialog v-model:visible="showAnnouncementDialog" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
            :style="{ width: '28rem', margin: '0 10px' }" dismissableMask modal>
        <div v-if="dataShow" style="width: 100%; max-width: 25em; overflow: hidden">
            <div class="flex justify-content-center" style="overflow: hidden;">
                <Image
                    :src="dataShow.image ? `https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${dataShow.image.data.fullPath}` : `https://i.pinimg.com/originals/1f/60/62/1f6062bf20e210bfc3b30cf53b7df6dc.jpg`"
                    alt="user header" height="180" preview width="350" />
            </div>
            <h3> {{ dataShow.title }}</h3>
            <p class="m-0" v-html="dataShow.description.replace(/\n/g, '<br>')">
            </p>
        </div>
    </Dialog>
    <div id="announcement-items" class="flex gap-3 flex-column md:flex-row flex-wrap">
        <div v-for="event in events" :key="event.id" class="p-card cursor-pointer"
             style="width: 100%; max-width: 25em; overflow: hidden"
             @click="showDataModal(event)"
        >
            <div class=" card-c flex justify-content-center" style="overflow: hidden;">
                <Image
                    :src="event.image ? `https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${event.image.data.fullPath}` : `https://i.pinimg.com/originals/1f/60/62/1f6062bf20e210bfc3b30cf53b7df6dc.jpg`"
                    alt="user header" height="180" width="350" />
            </div>
            <div class="p-2">
                <h5>{{ event.title }}</h5>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>