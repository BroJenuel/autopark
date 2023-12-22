
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY
// Create a single supabase client for interacting with your database
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const signInUser = async (email, password) => {
    return await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    })
}