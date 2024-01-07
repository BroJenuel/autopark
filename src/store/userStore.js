import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user',() => {
    const session = ref(null);
    return {
        session,
        role: computed(() => {
            return session.value?.user?.app_metadata?.role ?? 'driver';
        }),
        id: computed(() => {
            return session.value?.user?.id ?? null;
        })
    }
})