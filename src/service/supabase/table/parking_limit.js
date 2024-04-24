import { supabaseClient } from "../supabase";

export async function fetchParkingLimit() {
    const { data } = await supabaseClient.from("parking_limit").select("*").limit(1).single().throwOnError();

    return data;
}

export async function updateParkingLimit(parking_limit) {
    const { data } = await supabaseClient
        .from("parking_limit")
        .update({
            parking_limit,
        })
        .eq("id", 1)
        .throwOnError();

    return data;
}
