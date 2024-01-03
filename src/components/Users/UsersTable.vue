<script setup>
import { onMounted, ref } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { supabaseClient, supabaseSecretClient } from '@/service/supabase/supabase';
import dayjs from 'dayjs';

onMounted(() => {
    loadLazyData();
});

const loading = ref(false);
const usersData = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const columns = ref([
    { field: 'name', header: 'Name' },
    { field: 'country.name', header: 'Country' },
    { field: 'company', header: 'Company' },
    { field: 'representative.name', header: 'Representative' }
]);

const loadLazyData = async (event) => {
    loading.value = true;
    const getUserProfiles = supabaseClient
        .from('user_profile')
        .select()
        .limit(1000);

    const { data, error } = await getUserProfiles.eq('role', props.role);

    loading.value = false;

    if (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        return;
    }

    usersData.value = data.map(user => ({
        ...user,
        ...user.data,
        full_name: `${user.data.first_name ?? ''} ${user.data.middle_name ?? ''} ${user.data.last_name ?? ''}`,
        client_role: getClientRole(user.role)
    }));

    console.log(usersData.value)
};

function getClientRole(supabase_user_role) {
    if (supabase_user_role === 'service_role') return 'admin';
    if (supabase_user_role === 'authenticated') return 'driver';
    if (supabase_user_role === 'authenticated') return 'driver';
}

const props = defineProps({
    role: {
        type: String,
        default: null
    }
})

defineEmits(['editUser']);

defineExpose({
    loadLazyData
});

</script>


<template>
    <DataTable
        v-model:filters="filters"
        :globalFilterFields="['name', 'id']"
        :loading="loading"
        :sortOrder="-1"
        :value="usersData"
        sortField="created_at"
        tableStyle="min-width: 50rem"
    >
        <template #header>
            <div class="flex justify-content-end">
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                </span>
            </div>
        </template>
        <Column field="created_at" header="Date Created" sortable>
            <template #body="slotProps">
                {{ new Date(slotProps.data.created_at).toLocaleString() }}
            </template>
        </Column>
        <Column field="user_id" header="ID" sortable></Column>
        <Column field="full_name" header="Full Name" sortable></Column>
        <Column field="contact_number" header="Contact Number" sortable>
            <template #body="{ data }">
                {{ data.contact_number ?? '-- not set --' }}
            </template>
        </Column>
        <Column field="birthday" header="Birthdate" sortable>
            <template #body="{ data }">
                {{ data.birthday ? dayjs(data.birthday).format('MMMM DD, YYYY') : '-- not set --' }}
            </template>
        </Column>
        <Column field="role" header="Role" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column header="Action">
            <template #body="slotProps">
                <Button
                    class="p-button-rounded p-button-success mr-2"
                    icon="pi pi-pencil"
                    @click="$emit('editUser', slotProps.data)"
                />
            </template>
        </Column>
    </DataTable>
</template>

