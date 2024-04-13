<script setup>
import { ref } from 'vue';
import { Loading } from 'notiflix';
import { log, supabaseClient } from "@/service/supabase/supabase";

const oldData = ref(null);
const emits = defineEmits(['stored']);
const showModal = ref(false);
const form = ref({
    id: null,
    name: null
});

function toggleModal(data = {
    id: null,
    name: null
}) {
    if (data != null) {
        form.value = JSON.parse(JSON.stringify(data));
        oldData.value = JSON.parse(JSON.stringify(data));
    }
    showModal.value = !showModal.value;
}

async function submit() {
    const isUpdate = form.value.id != null;

    Loading.standard(form.value.id ? 'Updating Street' : 'Adding New Street');

    const dataParams = {
        name: form.value.name
    };

    const storedStreet = isUpdate ? await supabaseClient
            .from('streets')
            .update(dataParams)
            .eq('id', form.value.id)
            .select()
        : await supabaseClient
            .from('streets')
            .insert(dataParams)
            .select();

    Loading.remove();

    if (storedStreet.error) {
        toast.add({ severity: 'error', summary: 'Error', detail: storedStreet.error.message });
        return;
    }

    await log.createLog('maintenance', isUpdate ? 'update' : 'create', dataParams, oldData.value);

    emits('stored', storedStreet.data);
    toggleModal();
}

defineExpose({
    toggleModal
});
</script>

<template>
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :header="form.id ? 'Update Street Name' : 'Add New Street'"
        :style="{ width: '50rem' }"
        modal
    >
        <form @submit.prevent="submit">
            <div class="flex flex-column gap-2 mb-3">
                <label>Street Name</label>
                <InputText v-model="form.name" placeholder="ex. Harrison Road" required />
            </div>
            <Button :label="form.id ? 'Update Parking Slot' : 'Create Parking Slot'" type="submit" />
        </form>
    </Dialog>
</template>