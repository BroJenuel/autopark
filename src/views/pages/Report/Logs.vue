<script setup>
import { supabaseClient } from "@/service/supabase/supabase";
import { onMounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from "primevue/api";
import dayjs from "dayjs";
import PayBookingModal from "@/components/BookingList/PayBookModal.vue";

const PayBookingModalRef = ref(false);
const loading = ref(false);
const toast = useToast();
const bookLists = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const dateRange = ref([
    null, null
]);

watch(() => dateRange.value, (val) => {
    console.log(val);
    getLogs();
}, { deep: true });

async function getLogs() {
    loading.value = true;
    const query = supabaseClient
        .from("logs")
        .select("*, user_profile(*)")
        .order("id", { ascending: false })
        .limit(1000);

    if (dateRange.value && dateRange.value[0]) {
        query
            .gte("created_at", dayjs(dateRange.value[0]).format("YYYY-MM-DD HH:mm:ss"));
    }

    if (dateRange.value && dateRange.value[1]) {
        query
            .lte("created_at", dayjs(dateRange.value[1]).format("YYYY-MM-DD HH:mm:ss"));
    }


    const { data, error } = await query;

    loading.value = false;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 6000 });
        return;
    }

    bookLists.value = data.map((book) => ({
        ...book,
        status: book.time_ended ? "Done" : "Pending"
    }));
}

function badgeTypeStatus(status) {
    if (status === "Done") return "success";
    if (status === "Pending") return "info";
    return "info";
}

onMounted(() => {
    getLogs();
});

function actionTypeTag(action) {
    if (action === "create") return "success";
    if (action === "update") return "warning";
}

const expandedRows = ref({});
</script>

<template>
    <div>
        <PayBookingModal ref="PayBookingModalRef" @paid="getLogs()" />
        <div class="card">
            <div class="flex justify-content-between align-items-center flex-wrap">
                <h5>Logs</h5>
                <div class="flex align-items-center gap-3 flex-wrap">
                    <Button icon="pi pi-refresh" label="Refresh" severity="secondary" @click="getLogs()" />
                </div>
            </div>
            <DataTable
                v-model:expandedRows="expandedRows"
                v-model:filters="filters"
                :globalFilterFields="['parking_slot.area', 'parking_slot.street', 'id', 'payment_method', 'status']"
                :loading="loading"
                :sortOrder="-1"
                :value="bookLists"
                dataKey="id"
                sortField="created_at"
                tableStyle="min-width: 70rem"
            >
                <template #header>
                    <Calendar v-model="dateRange[0]" :manualInput="false" placeholder="From Date" />
                    <Calendar v-model="dateRange[1]" :manualInput="false" placeholder="To Date" />

                    <div class="flex justify-content-end">
                        <IconField iconPosition="left">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                        </IconField>
                    </div>
                </template>
                <Column expander style="width: 5rem" />
                <Column field="created_at" header="Date Created" sortable>
                    <template #body="slotProps">
                        {{ new Date(slotProps.data.created_at).toLocaleString() }}
                    </template>
                </Column>
                <Column field="action" header="Action">
                    <template #body="{ data }">
                        <Tag :severity="actionTypeTag(data.action)" :value="data.action"></Tag>
                    </template>
                </Column>
                <Column field="type" header="Type">
                    <template #body="{ data }">
                        <Tag :value="data.type"></Tag>
                    </template>
                </Column>
                <Column field="user_profile" header="User">
                    <template #body="{ data }">
                        {{ data.user_profile.data.email ?? "None" }}
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div>
                        <h5>Data Changes</h5>
                        <DataTable :value="slotProps">
                            <Column field="new_data" header="New Data" sortable>
                                <template #body="{ data }">
                                    <pre style="white-space: pre-wrap">
                                            {{ data.new_data }}
                                    </pre>
                                </template>
                            </Column>
                            <Column field="old_data" header="Old Data" sortable>
                                <template #body="{ data }">
                                    <pre style="white-space: pre-wrap">
                                            {{ data.old_data }}
                                    </pre>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
