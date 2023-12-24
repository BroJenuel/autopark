import { supabaseClient, supabaseSecretClient, userStorageKey } from '@/service/supabase/supabase';
import SnapStorage from 'snap-storage';

/**
 * Get My Role
 * @returns {Promise<*>}
 */
export const getRole = async () => {
    const session = SnapStorage.get(userStorageKey);
    if (!session) {
        alert('Please relogin');
        window.location.href = '/login';
    }

    if (session['role']) return session['role'];

    const role = await supabaseSecretClient
        .from('user_roles')
        .select()
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

    if (role.error) throw role.error.message;

    session['role'] = role.data;
    SnapStorage.set(userStorageKey, session);

    return role.data;
};


export const getDetails = async () => {
    const session = SnapStorage.get(userStorageKey);
    if (!session) {
        alert('Please relogin');
        window.location.href = '/login';
    }

    if (session['details']) return session['details'];

    const details = await supabaseClient
        .from('user_details')
        .select()
        .eq('user_id', session.user.id)
        .limit(1)
        .single();

    if (details.error) throw details.error.message;

    session['details'] = details.data;
    SnapStorage.set(userStorageKey, session);

    return details.data;
};