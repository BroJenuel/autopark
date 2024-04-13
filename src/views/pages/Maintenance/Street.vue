<script setup>
import { onMounted, ref } from "vue";
import StoreStreetModal from "@/components/Street/StoreStreet.vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import { supabaseClient } from "@/service/supabase/supabase";

const loading = ref(false);
const toast = useToast();
const StoreStreetModalRef = ref();
const streetsData = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

async function getEventsAndAnnouncements() {
    loading.value = true;
    const { data, error } = await supabaseClient.from("streets").select();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message });
        return;
    }

    streetsData.value = data;
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
    <StoreStreetModal ref="StoreStreetModalRef" @stored="getEventsAndAnnouncements" />
    <div class="card">
        <div class="flex justify-content-between align-items-center">
            <h3><span class="pi pi-fw pi-map" style="font-size: 1.5rem"></span> Streets</h3>
            <div class="flex align-items-center">
                <Button class="mr-2" icon="pi pi-plus" label="Create" @click="StoreStreetModalRef.toggleModal()" />
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
            :globalFilterFields="['name', 'id']"
            :loading="loading"
            :sortOrder="-1"
            :value="streetsData"
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
            <Column field="id" header="ID" sortable></Column>
            <Column field="name" header="Name" sortable></Column>
            <Column header="Action">
                <template #body="slotProps">
                    <Button
                        class="p-button-rounded p-button-success mr-2"
                        icon="pi pi-pencil"
                        @click="StoreStreetModalRef.toggleModal(slotProps.data)"
                    />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
