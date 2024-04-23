import { supabaseClient } from "@/service/supabase/supabase";

export async function createIncidentReport({ parking_slot_booking_id, description, image }) {
    const { data, error } = await supabaseClient
        .from("incident_reports")
        .insert({
            parking_slot_booking_id,
            description,
            image,
        })
        .select();

    if (error) {
        throw new Error(error);
    }

    return data;
}
