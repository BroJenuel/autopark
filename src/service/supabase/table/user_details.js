import { supabaseClient, supabaseSecretClient } from './../supabase';

export const createUser = async (data) => {
    const availableRules = {
        'admin': 'service_role',
        'driver': 'authenticated',
        'parking_attendant': 'authenticated'
    }

    const userMetaData = JSON.parse(JSON.stringify(data));
    delete userMetaData['role'];
    delete userMetaData['password'];

    const newUser = await supabaseSecretClient.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        app_metadata: {
            provider: 'email',
            providers: ['email'],
            role: data.role
        },
        user_metadata: userMetaData,
        role: availableRules[data.role]
    })

    if (newUser.error) throw newUser.error.message;

    return newUser.data;
}
