<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onMounted, ref } from 'vue';
import { checkTheme } from '@/service/layout';
import { isSignedIn, signInUser } from '@/service/supabase/supabase';
import { useRouter } from 'vue-router';
import DarkImageLogo from '@/assets/images/auto-park-for-dark.png';
import LightImageLogo from '@/assets/images/auto-park-for-light.png';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const router = useRouter();
const showError = ref(false);
const showErrorMessage = ref('Error Message');
const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);

const logoUrl = computed(() => {
    return layoutConfig.darkTheme.value ? DarkImageLogo : LightImageLogo;
});

async function SignIn() {
    const { error } = await signInUser(email.value, password.value);

    if (error) {
        showError.value = true;
        showErrorMessage.value = error.message;
        return;
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Login successful', life: 3000 });
    await router.push('/');
}

onMounted(async () => {
    checkTheme();
    if (await isSignedIn()) {
        toast.add({ severity: 'info', summary: 'Info', detail: 'Already Subscribed', life: 3000 });
        await router.push('/');
    }
});
</script>

<template>
    <div class="flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img :src="logoUrl" alt="Sakai logo" class="mb-5 flex-shrink-0" />
                        <div class="text-900 text-3xl font-medium mb-3">Find Your Parking</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                    <Message v-show="showError" severity="error">{{ showErrorMessage }}</Message>
                    <div>
                        <label class="block text-900 text-xl font-medium mb-2" for="email1">Email</label>
                        <InputText id="email1" v-model="email" class="w-full md:w-30rem mb-5"
                                   placeholder="Email address"
                                   style="padding: 1rem" type="text" />

                        <label class="block text-900 font-medium text-xl mb-2" for="password1">Password</label>
                        <Password
                            id="password1"
                            v-model="password"
                            :feedback="false"
                            :inputStyle="{ padding: '1rem' }"
                            :toggleMask="true"
                            class="w-full mb-3"
                            inputClass="w-full"
                            placeholder="Password"
                        ></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox id="rememberme1" v-model="checked" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer"
                               style="color: var(--primary-color)">Forgot password?</a>
                        </div>
                        <Button class="w-full p-3 text-xl" label="Sign In" @click="SignIn()"></Button>
                    </div>
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
