import { supabaseClient } from "@/service/supabase/supabase";

export const getParkingSlots = async () => {
    return supabaseClient.from("parking_slot").select("*");
};

export const createParkingSlot = async (data) => {
    return supabaseClient.from("parking_slot").insert(data).select();
};

export const updateParkingSlot = async (data) => {
    return supabaseClient.from("parking_slot").update(data).eq("id", data.id).select();
};

export function updateParkingSlotStatus(ids, status) {
    return supabaseClient.from("parking_slot").update({ status: status }).in("id", ids).select();
}

export const getParkingSlotBooking = async (id) => {
    const { data, error } = await supabaseClient
        .from("parking_slot_booking")
        .select("*")
        .eq("parking_slot_id", id)
        .limit(1)
        .single();

    if (error) {
        throw new Error(error);
    }

    return data;
};
