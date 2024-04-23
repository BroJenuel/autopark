<script setup>
import { createIncidentReport, uploadImage } from "@/service/supabase/table/incident_report";
import { getParkingSlotBooking } from "@/service/supabase/table/parking_slot";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

const form = ref({
    description: null,
    image: null,
});
const parking_slot_id = ref(null);
const showModal = ref(false);
const toast = useToast();

/**
 * Toggles the visibility of the modal with the given ID.
 *
 * @param {number} id - The ID of the parking slot
 */
function toggleModal(id) {
    showModal.value = !showModal.value;
    parking_slot_id.value = id;
    form.value = {
        description: null,
        image: null,
    };
}

/**
 * Handles the upload of an image for the incident report.
 *
 * @param {Event} event - The event object containing the uploaded files.
 * @returns {void}
 */
async function handleUploadImage(event) {
    form.value.image = event.files[0];
}

async function handleSubmit() {
    try {
        Loading.standard("Creating incident report...");
        const data = await getParkingSlotBooking(parking_slot_id.value);
        if (!data.id) {
            throw new Error("Parking slot booking not found.");
        }

        const uploadedImage = form.value.image ? await uploadImage(form.value.image) : null;
        await createIncidentReport({
            ...form.value,
            image: uploadedImage,
            parking_slot_booking_id: data.id,
        });

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Incident report was successfully created!",
            life: 3000,
        });
        showModal.value = false;
    } catch (e) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: e.message ?? "Unable to create an incident report.",
            life: 3000,
        });
    } finally {
        Loading.remove();
    }
}

defineExpose({ toggleModal });
</script>

<template>
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        header="Create an Incident Report"
        :style="{ width: '50rem' }"
        modal
    >
        <form @submit.prevent="handleSubmit">
            <div class="flex flex-column gap-2 mb-3">
                <label>Description</label>
                <Textarea v-model="form.description"></Textarea>
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Image</label>
                <FileUpload accept="image/*" mode="basic" @select="handleUploadImage($event)" />
            </div>
            <Button label="Submit" type="submit" />
        </form>
    </Dialog>
</template>
