import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    console.log('Starting get-onboarding-progress function');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return new Response(JSON.stringify({
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(JSON.stringify({
        error: 'Authentication failed',
        details: authError?.message
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('User found:', user.id);

    // First, let's check if the user exists in the users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, latest_completed_step')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Existing user check:', { existingUser, checkError });

    // If user doesn't exist, create a record with default values
    if (!existingUser) {
      console.log('User not found in users table, creating new record...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          latest_completed_step: 0,
          // Add other default fields if needed
        })
        .select('latest_completed_step')
        .single();

      if (insertError) {
        console.log('Error creating user record:', insertError);
        return new Response(JSON.stringify({
          error: 'Failed to initialize user record',
          details: insertError.message
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Created new user record:', newUser);
      return new Response(JSON.stringify({
        latest_completed_step: newUser.latest_completed_step
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // User exists, return their progress
    console.log('Latest completed step:', existingUser.latest_completed_step);

    return new Response(JSON.stringify({
      latest_completed_step: existingUser.latest_completed_step
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
