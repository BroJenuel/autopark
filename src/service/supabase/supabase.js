import { createClient } from "@supabase/supabase-js";
import { createUser, updateUser } from "@/service/supabase/table/user_details";
import { useUserStore } from "@/store/userStore";
import { createLog } from "./table/logs";
import { updateParkingSlotStatus } from "@/service/supabase/table/parking_slot";

export const userStorageKey = "autopark-user";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseSecretKey = import.meta.env.VITE_SUPABASE_SECRET_KEY;

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseSecretClient = createClient(supabaseUrl, supabaseSecretKey);

export const signInUser = async (email, password) => {
    return await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });
};

export const signOutUser = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error.message;
    return true;
};

export const signUpUser = async (data) => {
    const userMetadata = JSON.parse(JSON.stringify(data));
    delete userMetadata["role"];
    delete userMetadata["password"];

    const { error } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: userMetadata,
        },
    });
    if (error) throw error.message;
    return true;
};

export const isSignedIn = async (returnBoolean = true) => {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data || !data.session) return false;

    const user = useUserStore();
    user.session = data.session;

    return returnBoolean ? !!data.session : data.session;
};

export const user = {
    create: createUser,
    update: updateUser,
};

export const me = {};

export const log = {
    createLog: createLog,
};

export const parkingSlot = {
    updateParkingSlotStatus
}