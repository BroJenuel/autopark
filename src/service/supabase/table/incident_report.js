import { supabaseClient } from "@/service/supabase/supabase";
import { getFileExtension } from "@/utils/file";

/**
 * Uploads an image to the Supabase storage.
 * @param {File} image - The image file to be uploaded.
 * @returns {Promise} - A promise that resolves when the image is successfully uploaded.
 */
export async function uploadImage(image) {
    const { data, error } = await supabaseClient.storage
        .from("public storage")
        .upload("images/incident_reports/" + Date.now() + "-" + getFileExtension(image.name), image);
    if (error) {
        throw new Error(error);
    }

    return data;
}

export async function fetchAllIncidentReports() {
    const { data, error } = await supabaseClient.from("incident_reports").select("*");
    if (error) {
        throw new Error(error);
    }

    return data;
}

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
