import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase;

    const isClient = typeof window !== 'undefined';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    
    // On client, we MUST use the public anon key.
    // On server, we prefer service_role but can fallback to anon if needed.
    const supabaseKey = isClient 
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        : (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!supabaseUrl || !supabaseKey) {
        const errorMsg = isClient 
            ? 'Supabase configuration missing on client! Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
            : 'Missing Supabase URL or Key environment variables.';
        
        console.error(errorMsg);
        
        // If on client, we return a "dead" client that at least doesn't crash the proxy during boot
        // though actual calls will fail. This avoids the hydration/mount crash.
        if (isClient) {
            _supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
            return _supabase;
        }
        
        throw new Error(errorMsg);
    }

    _supabase = createClient(supabaseUrl, supabaseKey);
    return _supabase;
}

// Proxy that lazily initializes the client on first use
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        const value = (client as any)[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    },
});
