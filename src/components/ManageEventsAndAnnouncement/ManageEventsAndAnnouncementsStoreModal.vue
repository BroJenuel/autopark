<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { log, supabaseClient } from "@/service/supabase/supabase";
import { getFileExtension } from "@/utils/file";

const oldData = ref(null);
const toast = useToast();
const emits = defineEmits(["stored"]);
const showModal = ref(false);
const form = ref({
    id: null,
    title: null,
    description: null,
    image: null,
    type: null,
    status: "active",
});

const eventsAnnouncementTypeOptions = [
    { name: "Announcement", code: "announcement" },
    { name: "Event", code: "event" },
];

const eventsAnnouncementStatusOptions = [
    { name: "Active", code: "active" },
    { name: "Inactive", code: "inactive" },
];

function toggleModal(
    data = {
        id: null,
        title: null,
        description: null,
        image: null,
        type: null,
        status: "active",
    },
) {
    if (data != null) {
        form.value = data;
        oldData.value = data;
    }
    showModal.value = !showModal.value;
}

async function submit() {
    const isUpdate = form.value.id != null;

    if (!form.value.type || !form.value.status) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Please select an event type or status",
            life: 3000,
        });
        return;
    }

    const isNewImage = form.value.image && form.value.image instanceof File;
    const uploadImage = isNewImage
        ? await supabaseClient.storage
              .from("public storage")
              .upload("images/events/" + Date.now() + "-" + getFileExtension(form.value.image.name), form.value.image)
        : null;

    const dataParams = {
        title: form.value.title,
        description: form.value.description,
        image: isNewImage ? uploadImage : form.value.image,
        type: form.value.type,
        status: form.value.status,
    };

    // then add the data
    const addEventAnnouncement = isUpdate
        ? await supabaseClient.from("events_announcements").update(dataParams).eq("id", form.value.id).select()
        : await supabaseClient.from("events_announcements").insert(dataParams).select();

    if (addEventAnnouncement.error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: addEventAnnouncement.error,
        });
    }

    await log.createLog("announcements", isUpdate ? "update" : "create", dataParams, oldData.value);

    emits("stored", addEventAnnouncement.data);
    toggleModal();
}

const customBase64Uploader = async (event) => {
    form.value.image = event.files[0];
};

defineExpose({
    toggleModal,
});
</script>

<template>
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :header="form.id ? 'Edit Event/Announcement' : 'Add Event/Announcement'"
        :style="{ width: '50rem' }"
        modal
    >
        <form @submit.prevent="submit">
            <div class="flex flex-column gap-2 mb-3">
                <label>Title</label>
                <InputText v-model="form.title" placeholder="ex. The Event" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Description</label>
                <Textarea v-model="form.description" placeholder="ex. 16.411697048290645" required rows="5" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Select Image</label>
                <FileUpload accept="image/*" mode="basic" @select="customBase64Uploader($event)" />
                <img
                    v-if="form.image && form.image.data && form.image?.data?.fullPath"
                    :src="`https://hqymkslkcmsenuymkgej.supabase.co/storage/v1/object/public/${form.image.data.fullPath}`"
                    alt=""
                    width="150px"
                />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Type</label>
                <Dropdown
                    v-model="form.type"
                    :options="eventsAnnouncementTypeOptions"
                    class="w-full md:w-14rem"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select Type"
                    required
                />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Status</label>
                <Dropdown
                    v-model="form.status"
                    :options="eventsAnnouncementStatusOptions"
                    class="w-full md:w-14rem"
                    optionLabel="name"
                    optionValue="code"
                    placeholder="Select Status"
                    required
                />
            </div>
            <Button :label="form.id ? 'Update Event/Announcement' : 'Create Event/Announcement'" type="submit" />
        </form>
    </Dialog>
</template>
