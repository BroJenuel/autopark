import { supabaseClient } from "./../supabase";

export async function createLog(type, action, newData, oldData) {
    if (!["create", "update", "delete"].includes(action)) {
        throw new Error("Invalid log action type");
    }

    if (!["maintenance", "parking", "user", "announcements"].includes(type)) {
        throw new Error("Invalid log type");
    }

    return supabaseClient.from("logs").insert({
        type: type,
        action,
        new_data: newData,
        old_data: oldData,
    });
}
