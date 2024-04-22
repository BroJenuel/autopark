<script setup>
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const showConfirmationDialog = () => {
    confirm.require({
        group: "deleteEventOrAnnouncementModal",
        header: "Confirmation",
        message: "Are you sure you want to delete this event or announcement?",
        icon: "pi pi-exclamation-circle",
        acceptIcon: "pi pi-check",
        rejectIcon: "pi pi-times",
        rejectClass: "p-button-outlined p-button-sm",
        acceptClass: "p-button-sm",
        rejectLabel: "Cancel",
        acceptLabel: "Delete",
        accept: () => {
            toast.add({ severity: "success", summary: "Confirmed", detail: "Record deleted", life: 3000 });
        },
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
