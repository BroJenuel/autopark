import { supabaseClient } from "./../supabase"

export const insert = async (data) => {
    const { data, error } = await supabaseClient
        .from('user_details')
        .insert([
            { some_column: 'someValue', other_column: 'otherValue' },
        ])
        .select()

    if (error) throw error.message

    return data;
}