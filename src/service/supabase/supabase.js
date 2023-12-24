import { createClient } from "@supabase/supabase-js";
import SnapStorage from 'snap-storage';
import { createUser } from '@/service/supabase/table/user_details';

export const userStorageKey = 'autopark-user';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseSecretKey = import.meta.env.VITE_SUPABASE_SECRET_KEY;
// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseSecretClient = createClient(supabaseUrl, supabaseSecretKey);

export const signInUser = async (email, password) => {
    const response = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (response.error) throw response.error.message;

    return response;
};

export const signOutUser = async () => {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error.message;
    return true;
}

export const isSignedIn = async () => {
    const {data, error} = await supabaseClient.auth.getSession();
    if (error || !data || !data.session) return false;
    return !!data.session;
}

export const user = {
    create: createUser,
}

export const me = {
}