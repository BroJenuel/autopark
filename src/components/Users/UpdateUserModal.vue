<script setup>
import { ref } from "vue";
import { user } from "@/service/supabase/supabase";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import dayjs from "dayjs";

const toast = useToast();
const props = defineProps({
    role: String,
});
const form = ref({
    id: null,
    email: null,
    password: null,
    contact_number: null,
    first_name: null,
    middle_name: null,
    last_name: null,
    suffix_name: null,
    birthday: null,
    region: null,
    province: null,
    city: null,
    barangay: null,
    street: null,
    role: props.role,
    driver_license: null,
    driver_license_expiration: null,
});

const showModal = ref(false);

function toggleModal(data = null) {
    if (!data) {
        toast.add({ severity: "error", summary: "Error", detail: "User is required", life: 3000 });
        return;
    }
    form.value = {
        id: data.user_id,
        email: data.email,
        password: null,
        contact_number: data.contact_number,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        suffix_name: data.suffix_name,
        birthday: data.birthday,
        region: data.region,
        province: data.province,
        city: data.city,
        barangay: data.barangay,
        street: data.street,
        role: data.role,
        driver_license: data.driver_license ?? null,
        driver_license_expiration: data.driver_license_expiration ?? null,
    };

    showModal.value = !showModal.value;
}

function isFormValid() {
    let invalid = 0;
    if (!form.value.first_name) {
        toast.add({ severity: "error", summary: "Error", detail: "First name is required" });
        invalid++;
    }

    if (!form.value.email) {
        toast.add({ severity: "error", summary: "Error", detail: "Email is required" });
        invalid++;
    }

    if ((form.value.role === "driver" && !form.value.driver_license) || form.value.driver_license.length !== 11) {
        toast.add({ severity: "error", summary: "Error", detail: "Driver license is required", life: 3000 });
        invalid++;
    }

    if (form.value.role === "driver" && !form.value.driver_license_expiration) {
        toast.add({ severity: "error", summary: "Error", detail: "Driver license expiration is required" });
        invalid++;
    }

    return invalid === 0;
}

async function submit() {
    try {
        if (!isFormValid()) return;

        Loading.standard("saving user");
        const data = JSON.parse(JSON.stringify(form.value));

        const storedUser = await user.update(data);

        form.value = {
            id: null,
            email: null,
            password: null,
            contact_number: null,
            first_name: null,
            middle_name: null,
            last_name: null,
            suffix_name: null,
            birthday: null,
            region: null,
            province: null,
            city: null,
            barangay: null,
            street: null,
            role: props.role,
        };

        showModal.value = false;
        emit("userUpdated", storedUser);
    } catch (error) {
        toast.add({ severity: "error", summary: "Error", detail: error });
    }
    Loading.remove();
}

const emit = defineEmits(["userUpdated"]);

defineExpose({
    toggleModal,
});

const licenseExpirationMinDate = ref(dayjs().add("1", "day").toDate());
</script>

<template>
    <Dialog
        v-model:visible="showModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :header="`Update ${
            role
                ? role
                      .split('_')
                      .map((string) => {
                          return string.charAt(0).toUpperCase() + string.slice(1);
                      })
                      .join(' ')
                : ''
        }`"
        :style="{ width: '50rem' }"
        modal
    >
        <form @submit.prevent="submit">
            <div class="mb-5">
                <h3 class="mb-2">Account Information</h3>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Email</label>
                    <InputText v-model="form.email" placeholder="ex. example@gmail.com" required />
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Contact Number</label>
                    <InputText v-model="form.contact_number" placeholder="ex. 09503244478" />
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Password</label>
                    <Password v-model="form.password" placeholder="ex. 09503244478" style="display: grid" />
                </div>
            </div>

            <h3 class="mb-2">Personal Information</h3>
            <div class="flex flex-column gap-2 mb-3">
                <label>First Name</label>
                <InputText v-model="form.first_name" placeholder="ex. Jhon" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Middle Name</label>
                <InputText v-model="form.middle_name" placeholder="ex. Doe" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Last Name</label>
                <InputText v-model="form.last_name" placeholder="ex. Smith" required />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Suffix Name (OPTIONAL)</label>
                <InputText v-model="form.suffix_name" placeholder="ex. i.e. Jr, Sr, III" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Birthdate</label>
                <Calendar v-model="form.birthday" placeholder="Select Your Birthdate" />
            </div>
            <h4>Home Address</h4>
            <div class="flex flex-column gap-2 mb-3">
                <label>Region</label>
                <InputText v-model="form.region" placeholder="ex. Bulacan" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Province</label>
                <InputText v-model="form.province" placeholder="ex. Cebu" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>City/Municipality</label>
                <InputText v-model="form.city" placeholder="ex. Baguio" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Barangay</label>
                <InputText v-model="form.barangay" placeholder="ex. Pico" />
            </div>
            <div class="flex flex-column gap-2 mb-3">
                <label>Block No., Street, Village etc. *</label>
                <InputText v-model="form.street" placeholder="ex. Blk. 1, " />
            </div>
            <template v-if="role === 'driver'">
                <h3 class="mb-2">Drivers License</h3>
                <div class="mb-5">
                    <label>License #</label>
                    <InputOtp
                        v-model="form.driver_license"
                        :length="11"
                        style="gap: 0; display: flex; align-items: center"
                    >
                        <template #default="{ attrs, events, index }">
                            <input type="text" v-bind="attrs" v-on="events" class="custom-otp-input" />
                            <div v-if="index === 3 || index === 5" class="px-1">
                                <i class="pi pi-minus" />
                            </div>
                        </template>
                    </InputOtp>
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>License Expiration</label>
                    <Calendar
                        v-model="form.driver_license_expiration"
                        :minDate="licenseExpirationMinDate"
                        placeholder="Select Driver license expiration"
                        required
                    />
                </div>
            </template>
            <div class="flex flex-column gap-2 mb-3">
                <Button label="Submit" type="submit" />
            </div>
        </form>
    </Dialog>
</template>

<style lang="scss" scoped></style>
