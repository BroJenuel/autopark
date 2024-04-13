<script setup>
import { onMounted, ref } from "vue";
import ManageEventsAndAnnouncementsStoreModal from "@/components/ManageEventsAndAnnouncement/ManageEventsAndAnnouncementsStoreModal.vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import { supabaseClient } from "@/service/supabase/supabase";

const loading = ref(false);
const toast = useToast();
const ManageEventsAndAnnouncementsStoreModalRef = ref();
const eventsAnnouncements = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

async function getEventsAndAnnouncements() {
    loading.value = true;
    const { data, error } = await supabaseClient.from("events_announcements").select();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message });
        return;
    }

    eventsAnnouncements.value = data;
    loading.value = false;
}

function badgeTypeStatus(status) {
    if (status === "active") return "success";
    if (status === "inactive") return "danger";
    return "info";
}

onMounted(async () => {
    await getEventsAndAnnouncements();
});

const products = ref();
</script>
<template>
    <ManageEventsAndAnnouncementsStoreModal
        ref="ManageEventsAndAnnouncementsStoreModalRef"
        @stored="getEventsAndAnnouncements"
    />
    <div class="card">
        <div class="flex justify-content-between align-items-center">
            <h3><span class="pi pi-fw pi-map" style="font-size: 1.5rem"></span> Manage Events And Announcements</h3>
            <div class="flex align-items-center">
                <Button
                    class="mr-2"
                    icon="pi pi-plus"
                    label="Create"
                    @click="ManageEventsAndAnnouncementsStoreModalRef.toggleModal()"
                />
                <Button
                    icon="pi pi-refresh"
                    severity="secondary"
                    title="Refresh"
                    @click="getEventsAndAnnouncements()"
                />
            </div>
        </div>
        <DataTable
            v-model:filters="filters"
            :globalFilterFields="['title', 'description', 'status']"
            :loading="loading"
            :sortOrder="-1"
            :value="eventsAnnouncements"
            sortField="created_at"
            tableStyle="min-width: 50rem"
        >
            <template #header>
                <div class="flex justify-content-end">
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template>
            <Column field="created_at" header="Date Created" sortable>
                <template #body="slotProps">
                    {{ new Date(slotProps.data.created_at).toLocaleString() }}
                </template>
            </Column>
            <Column field="title" header="Title" sortable>
                <template #body="slotProps">
                    <Badge :value="slotProps.data.type" severity="info"></Badge>
                    <div>{{ slotProps.data.title }}</div>
                </template>
            </Column>
            <Column field="description" header="Description" sortable></Column>
            <Column field="image" header="Image" sortable>
                <template #body="slotProps">
                    <Image
                        v-if="slotProps.data.image"
                        :src="`https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${slotProps.data.image.data.fullPath}`"
                        alt="Image"
                        preview
                        width="150"
                    />
                    <span v-else>No Image</span>
                </template>
            </Column>
            <Column field="status" sortable header="Status">
                <template #body="slotProps">
                    <Badge :value="slotProps.data.status" :severity="badgeTypeStatus(slotProps.data.status)"></Badge>
                </template>
            </Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button
                        class="p-button-rounded p-button-success mr-2"
                        icon="pi pi-pencil"
                        @click="ManageEventsAndAnnouncementsStoreModalRef.toggleModal(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
