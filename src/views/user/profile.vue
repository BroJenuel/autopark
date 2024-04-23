<script setup>
import { onMounted, ref } from "vue";
import { supabaseClient, user } from "@/service/supabase/supabase";
import { Loading } from "notiflix";
import { useToast } from "primevue/usetoast";
import { useUserStore } from "@/store/userStore";
import dayjs from "dayjs";

const userStore = useUserStore();
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
    driver_licence: null,
    driver_license_expiration: null,
});

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

    return invalid === 0;
}

async function submit() {
    try {
        if (!isFormValid()) return;

        Loading.standard("saving user");
        const data = JSON.parse(JSON.stringify(form.value));

        const storedUser = await user.update(data);
        toast.add({ severity: "success", summary: "Success", detail: "User updated successfully" });
    } catch (error) {
        toast.add({ severity: "error", summary: "Error", detail: error });
    }
    Loading.remove();
}

onMounted(async () => {
    let { data, error } = await supabaseClient.from("user_profile").select().eq("user_id", userStore.id).single();

    if (error) {
        toast.add({ severity: "error", summary: "Error", detail: error });
    }

    form.value = {
        ...data.data,
        driver_license_expiration: dayjs(data.data.driver_license_expiration).toDate(),
    };
});
</script>

<template>
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

        <div class="gap-2">
            <h3>Driver's License Information</h3>
            <div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Driver's License</label>
                    <InputText v-model="form.driver_license" placeholder="NEQ-5505" required />
                </div>
                <div class="flex flex-column gap-2 mb-3">
                    <label>Expiration</label>
                    <Calendar v-model="form.driver_license_expiration" placeholder="Driver's License's Expiration" dateFormat="dd/mm/yy" />
                </div>
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
        <div class="flex flex-column gap-2 mb-3">
            <Button label="Submit" type="submit" />
        </div>
    </form>
</template>
