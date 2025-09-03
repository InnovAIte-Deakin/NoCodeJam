/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Challenge verification constants (must match test_runner.py exactly)
const DEMO_USER_ID = "012a7929-5230-4aa5-93d1-5fc1a4cc0cd3";
const CHALLENGE_SALT = "jam_challenge_2024_salt_7f3a9b2e1d8c4f6a";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 Verify function called');

    // Initialize Supabase client for authentication (to track who completed the challenge)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔍 Auth header present:', !!authHeader);

    if (!authHeader) {
      console.log('❌ No auth header');
      return new Response(JSON.stringify({
        success: false,
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Authenticate user (for tracking completion)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 User authentication result:', { user: !!user, error: authError?.message });

    if (authError || !user) {
      console.log('❌ Authentication failed');
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication failed'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User authenticated:', user.id);

    // Get verification code from request
    const { code } = await req.json();
    console.log('✅ Code received:', code);

    // Use DEMO values for verification (must match test_runner.py exactly)
    const userId = DEMO_USER_ID;
    const salt = CHALLENGE_SALT;

    console.log('🔍 Using demo user ID for verification:', userId);
    console.log('🔍 Using challenge salt for verification');

    // Bucket time into hours (same as test_runner.py)
    const now = Math.floor(Date.now() / (1000 * 60 * 60));
    const input = `${userId}-${now}-${salt}`;
    const expected = (await sha256Hex(input)).slice(0, 12);

    console.log('🔍 Current hour:', now);
    console.log('🔍 Input string:', input);
    console.log('🔍 Expected code:', expected);
    console.log('🔍 Received code:', code);
    console.log('✅ Verification result:', code === expected);

    const success = code === expected;

    if (success) {
      // TODO: Mark challenge as completed for the authenticated user
      console.log('🎉 Challenge verification successful for user:', user.id);
    }

    return new Response(JSON.stringify({
      success,
      message: success ? 'Challenge verified successfully!' : 'Invalid verification code'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.log('❌ General error:', err.message);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
