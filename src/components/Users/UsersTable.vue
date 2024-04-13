<script setup>
import { onMounted, ref, watch } from "vue";
import { FilterMatchMode } from "primevue/api";
import { supabaseClient } from "@/service/supabase/supabase";
import dayjs from "dayjs";
import { Confirm } from "notiflix";

onMounted(() => {
    loadLazyData();
});

const showArchiveUser = ref(false);
watch(() => showArchiveUser.value, () => {
    clearTimeout(window.showArchiveUserTimer);

    window.showArchiveUserTimer = setTimeout(() => {
        loadLazyData();
    }, 500);
});

const loading = ref(false);
const usersData = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const columns = ref([
    { field: "name", header: "Name" },
    { field: "country.name", header: "Country" },
    { field: "company", header: "Company" },
    { field: "representative.name", header: "Representative" }
]);

const loadLazyData = async (event) => {
    loading.value = true;
    const getUserProfiles = supabaseClient
        .from("user_profile")
        .select()

        .limit(1000);

    if (!showArchiveUser.value) {
        getUserProfiles.is("deleted_at", null);
    }

    const { data, error } = await getUserProfiles.eq("role", props.role).order("created_at", { ascending: false });

    loading.value = false;

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
        return;
    }

    usersData.value = data.map((user) => ({
        ...user,
        ...user.data,
        full_name: `${user.data.first_name ?? ""} ${user.data.middle_name ?? ""} ${user.data.last_name ?? ""}`,
        client_role: getClientRole(user.role)
    }));

    console.log(usersData.value);
};

function getClientRole(supabase_user_role) {
    if (supabase_user_role === "service_role") return "admin";
    if (supabase_user_role === "authenticated") return "driver";
    if (supabase_user_role === "authenticated") return "driver";
}

const props = defineProps({
    role: {
        type: String,
        default: null
    }
});

defineEmits(["editUser", "archiveUser"]);

defineExpose({
    loadLazyData
});

function archiveUser(user) {
    Confirm.show(
        "Archive User",
        `Are you sure you want to archive ${user.full_name} ?`,
        "Yes",
        "No",
        async () => {
            const { error } = await supabaseClient
                .from("user_profile")
                .update({ deleted_at: dayjs().format() })
                .eq("user_id", user.id);

            if (error) {
                toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
            }

            await loadLazyData();
        },
        () => {},
        {
            okButtonBackground: "red",
            titleColor: "red"
        }
    );
}

function unArchiveUser(user) {
    Confirm.show(
        "Unarchived User",
        `Are you sure you want to restore ${user.full_name} ?`,
        "Yes",
        "No",
        async () => {

            const { error } = await supabaseClient
                .from("user_profile")
                .update({ deleted_at: null })
                .eq("user_id", user.id);

            if (error) {
                toast.add({ severity: "error", summary: "Error", detail: error.message, life: 3000 });
            }

            await loadLazyData();
        },
        () => {},
        {
            // yellow
            okButtonBackground: "#f59e0b",
            titleColor: "#f59e0b"
        }
    );
}
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
            <div class="flex justify-content-between align-items-center flex-wrap">
                <div class="flex align-items-center select-none">
                    <Checkbox v-model="showArchiveUser" :false-value="false" :true-value="true" binary
                              inputId="showArchiveUser" />
                    <label class="ml-2 cursor-pointer" for="showArchiveUser"> Show Archive Users </label>
                </div>
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
        <Column field="user_id" header="ID" sortable>
            <template #body="{ data }">
                <Tag v-if="data.deleted_at" severity="danger" value="Archived"></Tag>
                {{ data.user_id ?? "-- not set --" }}
            </template>
        </Column>
        <Column field="full_name" header="Full Name" sortable></Column>
        <Column field="contact_number" header="Contact Number" sortable>
            <template #body="{ data }">
                {{ data.contact_number ?? "-- not set --" }}
            </template>
        </Column>
        <Column field="birthday" header="Birthdate" sortable>
            <template #body="{ data }">
                {{ data.birthday ? dayjs(data.birthday).format("MMMM DD, YYYY") : "-- not set --" }}
            </template>
        </Column>
        <Column field="role" header="Role" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column header="Action">
            <template #body="slotProps">
                <div class="flex gap-2">
                    <Button
                        class="p-button-rounded p-button-success"
                        icon="pi pi-pencil"
                        @click="$emit('editUser', slotProps.data)"
                    />

                    <Button
                        v-if="slotProps.data.deleted_at"
                        class="p-button-rounded p-button-error"
                        icon="pi pi-arrow-right-arrow-left"
                        @click="unArchiveUser(slotProps.data)"
                    />
                    <Button
                        v-else
                        class="p-button-rounded p-button-danger"
                        icon="pi pi-times-circle"
                        @click="archiveUser(slotProps.data)"
                    />
                </div>
            </template>
        </Column>
    </DataTable>
</template>
