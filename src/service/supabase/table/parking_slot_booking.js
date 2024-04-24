import { supabaseClient } from "@/service/supabase/supabase";

export async function checkIfHasExistingBooking() {
    const theUser = await supabaseClient.auth.getUser();
    if (!theUser) {
        throw new Error("User not found");
    }

    const { data } = await supabaseClient
        .from("parking_slot_booking")
        .select("*, parking_slot!inner(*)")
        .eq("user_id", theUser.data.user.id)
        .eq("parking_slot.status", "occupied")
        .limit(1)
        .throwOnError();

    return data.length > 0;
}

export async function markAsAvailable(id) {
    return supabaseClient.rpc("mark_as_available", { parking_slot_id_update: id }).throwOnError();
}
