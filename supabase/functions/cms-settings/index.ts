import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop(); // "set", "del", "create_user", "update_user", "delete_user"

    // Handle errors gracefully
    const handleError = (error: any) => {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    };

    try {
        const body = await req.json();

        // ---------------------------------------------------------
        // SETTINGS MANAGEMENT
        // ---------------------------------------------------------

        if (path === 'set') {
            const { key, value } = body;
            if (!key) return handleError(new Error('Missing key'));

            const { error } = await supabase
                .from('global_settings')
                .upsert({
                    setting_key: key,
                    setting_value: value,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'setting_key' });

            if (error) return handleError(error);

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path === 'del') {
            const { key } = body;
            if (!key) return handleError(new Error('Missing key'));

            const { error } = await supabase.from('global_settings').delete().eq('setting_key', key);
            if (error) return handleError(error);

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ---------------------------------------------------------
        // USER MANAGEMENT
        // ---------------------------------------------------------

        // Verify authentication for user management actions
        if (['create_user', 'update_user', 'delete_user'].includes(path || '')) {
            // Get the Authorization header from the request
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders });
            }

            // Verify the user using the anon key client (client-side auth token)
            // We essentially manually verify the JWT here by getting the user from it
            const supabaseAnon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '');
            const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));

            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
            }

            // Check if the requesting user is an administrator
            // We need to check their profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError || !profile || profile.role !== 'administrator') {
                return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: corsHeaders });
            }
        }

        if (path === 'create_user') {
            const { email, password, role, fullName } = body;
            if (!email || !password) return handleError(new Error('Missing email or password'));

            // 1. Create user in Supabase Auth
            const { data: authData, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
            });

            if (createError) return handleError(createError);
            if (!authData.user) return handleError(new Error('Failed to create user'));

            // 2. Update their profile (Trigger might handle simple creation, but we want to ensure Role is set correctly)
            // Note: A trigger on auth.users usually creates the profile. We might need to wait or upsert.
            // Let's upsert to be safe and set the role immediately.
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    role: role || 'editor',
                    full_name: fullName,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                // Cleanup if profile fails? Probably better to just error out, admin can delete.
                console.error('Error updating profile for new user:', profileError);
                return handleError(profileError);
            }

            return new Response(JSON.stringify({ success: true, user: authData.user }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path === 'update_user') {
            const { id, password, role, fullName, email } = body;
            if (!id) return handleError(new Error('Missing user ID'));

            const updates: any = {};

            // Update Auth Data (Email, Password, Metadata)
            const authUpdates: any = { user_metadata: {} };
            let hasAuthUpdates = false;

            if (email) { authUpdates.email = email; hasAuthUpdates = true; }
            if (password) { authUpdates.password = password; hasAuthUpdates = true; }
            if (fullName) { authUpdates.user_metadata.full_name = fullName; hasAuthUpdates = true; }

            if (hasAuthUpdates) {
                const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates);
                if (authError) return handleError(authError);
            }

            // Update Profile Data
            if (role || fullName || email) {
                const profileUpdates: any = {};
                if (role) profileUpdates.role = role;
                if (fullName) profileUpdates.full_name = fullName;
                if (email) profileUpdates.email = email;
                profileUpdates.updated_at = new Date().toISOString();

                const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update(profileUpdates)
                    .eq('id', id);

                if (profileUpdateError) return handleError(profileUpdateError);
            }

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (path === 'delete_user') {
            const { id } = body;
            if (!id) return handleError(new Error('Missing user ID'));

            // Delete from Auth (Cascade should handle profile, but we can verify)
            const { error: deleteError } = await supabase.auth.admin.deleteUser(id);
            if (deleteError) return handleError(deleteError);

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });

    } catch (error) {
        return handleError(error);
    }
});
