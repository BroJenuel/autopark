<script setup>
import UsersTable from '@/components/Users/UsersTable.vue';
import StoreUserModal from '@/components/Users/StoreUserModal.vue';
import { ref } from 'vue';

const StoreUserModalRef = ref();
</script>

<template>
    <StoreUserModal ref="StoreUserModalRef" />
    <Card>
        <template #content>
            <div class="flex justify-content-between align-items-center">
                <h5>Admins</h5>
                <div>
                    <Button class="mr-2" label="Add" icon="pi pi-plus" @click="StoreUserModalRef.toggleModal()" />
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" />
                </div>
            </div>
            <UsersTable />
        </template>
    </Card>
</template>

<style scoped lang="scss">

</style>