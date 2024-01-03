<script setup>
import UsersTable from '@/components/Users/UsersTable.vue';
import StoreUserModal from '@/components/Users/StoreUserModal.vue';
import UpdateUserModal from '@/components/Users/UpdateUserModal.vue';

import { ref } from 'vue';

const UsersTableRef = ref();
const UpdateUserModalRef = ref()
const StoreUserModalRef = ref();
const role = ref('team_leader');
</script>

<template>
    <StoreUserModal ref="StoreUserModalRef" :role="role" @userStored="UsersTableRef.loadLazyData()" />
    <UpdateUserModal ref="UpdateUserModalRef" :role="role" @userUpdated="UsersTableRef.loadLazyData()" />
    <Card>
        <template #content>
            <div class="flex justify-content-between align-items-center">
                <h5>Team Leaders</h5>
                <div>
                    <Button class="mr-2" icon="pi pi-plus" label="Add" @click="StoreUserModalRef.toggleModal()" />
                    <Button icon="pi pi-refresh" label="Refresh" severity="secondary"
                            @click="UsersTableRef.loadLazyData()" />
                </div>
            </div>
            <UsersTable :role="role" ref="UsersTableRef" @editUser="(data) => UpdateUserModalRef.toggleModal(data)" />
        </template>
    </Card>
</template>