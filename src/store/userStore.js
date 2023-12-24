import { defineStore } from 'pinia';
import { ref } from 'vue';

export const userStore = defineStore('user',() => {
    const session = ref(null);
    return {
        session
    }
})