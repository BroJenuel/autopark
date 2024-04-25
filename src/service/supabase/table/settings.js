import { supabaseClient } from "../supabase";

export async function fetchParkingRates() {
    return await supabaseClient.from("settings").select().eq("id", 1).limit(1).single().throwOnError();
}
