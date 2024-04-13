<script setup>
import { useLayout } from "@/layout/composables/layout";
import { computed, onMounted, ref } from "vue";
import { checkTheme } from "@/service/layout";
import { isSignedIn, signUpUser, supabaseClient } from "@/service/supabase/supabase";
import { useRouter } from "vue-router";
import DarkImageLogo from "@/assets/images/auto-park-for-dark.png";
import LightImageLogo from "@/assets/images/auto-park-for-light.png";
import { useToast } from "primevue/usetoast";
import { Loading } from "notiflix";
import dayjs from "dayjs";

const toast = useToast();
const router = useRouter();
const showError = ref(false);
const showErrorMessage = ref("Error Message");
const { layoutConfig } = useLayout();

const form = ref({
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
    role: "driver",
    driver_license: null,
    driver_license_expiration: null,
});

const logoUrl = computed(() => {
    return layoutConfig.darkTheme.value ? DarkImageLogo : LightImageLogo;
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

    if (!form.value.driver_license || form.value.driver_license.length !== 11) {
        toast.add({ severity: "error", summary: "Error", detail: "Driver license is required" });
        invalid++;
    }

    if (form.value.role === "driver" && !form.value.driver_license_expiration) {
        toast.add({ severity: "error", summary: "Error", detail: "Driver license expiration is required" });
        invalid++;
    }

    return invalid === 0;
}

async function signUp() {
    if (!isFormValid()) return;

    const { error } = await signUpUser(form.value);

    if (error) {
        showError.value = true;
        showErrorMessage.value = error.message;
        return;
    }

    const theUserData = JSON.parse(JSON.stringify(form.value));
    delete theUserData["password"];
    const theUser = await supabaseClient.auth.getUser();

    Loading.standard("saving user profile...");

    await supabaseClient.from("user_profile").upsert(
        {
            user_id: theUser.data.user.id,
            data: theUserData,
            role: "driver",
        },
        { onConflict: "user_id" }
    );

    Loading.remove();

    toast.add({ severity: "success", summary: "Success", detail: "Login successful", life: 3000 });
    await router.push("/");
}

onMounted(async () => {
    checkTheme();
    if (await isSignedIn()) {
        toast.add({ severity: "info", summary: "Info", detail: "Already Subscribed", life: 3000 });
        await router.push("/");
    }
});

const licenseExpirationMinDate = ref(dayjs().add("1", "day").toDate());
</script>

<template>
    <div class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div
                class="my-3"
                style="
                    border-radius: 56px;
                    padding: 0.3rem;
                    background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);
                "
            >
                <div class="w-full surface-card py-8 px-5" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" alt="Sakai logo" class="mb-5 flex-shrink-0" />
                        <div class="text-900 text-3xl font-medium mb-3">Find Your Parking</div>
                        <span class="text-600 font-medium">Create Account</span>
                    </div>
                    <form @submit.prevent="signUp">
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
                                <Password
                                    v-model="form.password"
                                    placeholder="ex. 09503244478"
                                    required
                                    style="display: grid"
                                />
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
                            <label>Block No., Street, Village etc. *</label>
                            <InputText v-model="form.street" placeholder="ex. Blk. 1, " />
                        </div>
                        <h3 class="mb-2">Drivers License</h3>
                        <div class="mb-3">
                            <label>License</label>
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
                                dateFormat="dd/mm/yy"
                                required
                            />
                        </div>

                        <div class="flex flex-column gap-2 mb-3 mt-3">
                            <Button label="Submit" type="submit" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
