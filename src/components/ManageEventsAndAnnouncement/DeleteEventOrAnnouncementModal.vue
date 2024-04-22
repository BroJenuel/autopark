<script setup>
import { supabaseClient } from "@/service/supabase/supabase";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { Loading } from "notiflix";

const emits = defineEmits(["refetchTable"]);
const confirm = useConfirm();
const toast = useToast();

const handleConfirmDelete = async (id) => {
    Loading.standard();
    const { error } = await supabaseClient.from("events_announcements").delete().eq("id", id);
    Loading.remove();

    if (error) {
        return toast.add({ severity: "danger", summary: "Error", detail: "Unable to delete record.", life: 3000 });
    }

    emits("refetchTable");
    toast.add({ severity: "success", summary: "Confirmed", detail: "Record deleted", life: 3000 });
};

const showConfirmationDialog = (data) => {
    const message =
        data.type === "announcement"
            ? "Are you sure you want to delete this announcement?"
            : "Are you sure you want to delete this event?";

    confirm.require({
        group: "deleteEventOrAnnouncementModal",
        header: "Confirmation",
        message,
        icon: "pi pi-exclamation-circle",
        acceptIcon: "pi pi-check",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-outlined p-button-sm",
        acceptClass: "p-button-sm",
        rejectLabel: "Cancel",
        acceptLabel: "Delete",
        accept: () => handleConfirmDelete(data.id),
    });
};

defineExpose({
    showConfirmationDialog,
});
</script>

<template>
    <Toast></Toast>
    <ConfirmDialog group="deleteEventOrAnnouncementModal">
        <template #message="slotProps">
            <div class="flex flex-column align-items-center w-full gap-3">
                <i :class="slotProps.message.icon" class="text-6xl text-primary-500"></i>
                <p>{{ slotProps.message.message }}</p>
            </div>
        </template>
    </ConfirmDialog>
</template>
