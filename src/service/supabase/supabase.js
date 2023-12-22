import { createClient } from "@supabase/supabase-js";
import SnapStorage from 'snap-storage';

export const userStorageKey = 'autopark-user';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY;
// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const signInUser = async (email, password) => {
    const response = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    SnapStorage.set(userStorageKey, response.data);

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