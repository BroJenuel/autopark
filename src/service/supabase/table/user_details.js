import { supabaseClient, supabaseSecretClient } from './../supabase';

export const createUser = async (data) => {
    const availableRules = {
        'admin': 'service_role',
        'driver': 'authenticated',
        'parking_attendant': 'authenticated',
        'team_leader': 'authenticated'
    };

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
    });

    const { password, ...newData } = data;
    const savedUserProfile = await supabaseClient
        .from('user_profile')
        .upsert({
            user_id: newUser.data.user.id,
            data: newData,
            role: newData.role
        }, { onConflict: 'user_id' });

    if (newUser.error || savedUserProfile.error) throw newUser.error.message ?? savedUserProfile.error.message;

    return newUser.data;
};


export const updateUser = async (data) => {
    const availableRules = {
        'admin': 'service_role',
        'driver': 'authenticated',
        'parking_attendant': 'authenticated'
    };

    const userId = data.id;
    const userMetaData = JSON.parse(JSON.stringify(data));
    delete userMetaData['role'];
    delete userMetaData['password'];

    const userDataToUpdateAttributes = {
        app_metadata: {
            provider: 'email',
            providers: ['email'],
            role: data.role
        },
        user_metadata: userMetaData,
        role: availableRules[data.role]
    };

    if (data.password) {
        userDataToUpdateAttributes['password'] = data.password;
    }

    const theUserToUpdate = await supabaseSecretClient.auth.admin.getUserById(userId);
    if (theUserToUpdate.data.user.email !== data.email) {
        userDataToUpdateAttributes['email'] = data.email;
        userDataToUpdateAttributes.email_confirm = true;
    }

    const updatedUser = await supabaseSecretClient.auth.admin.updateUserById(userId, userDataToUpdateAttributes);

    if (updatedUser.error) throw updatedUser.error.message;
    console.log('updated user account');

    const { password, ...newData } = data;
    const newDataParsed = JSON.parse(JSON.stringify(newData));
    const savedUserProfile = await supabaseClient
        .from('user_profile')
        .update({
            data: newDataParsed,
            role: newDataParsed.role
        })
        .eq('user_id', userId)
        .select();

    console.log('saved user profile');

    return updatedUser.data;
};