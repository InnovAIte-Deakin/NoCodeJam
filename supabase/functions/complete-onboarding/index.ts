import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
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
    })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the request body to get challenge ID
    const { challengeId } = await req.json()
    
    if (!challengeId) {
      return new Response(
        JSON.stringify({ error: 'challengeId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate that the challenge exists
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title')
      .eq('id', challengeId)
      .single()

    if (challengeError || !challengeData) {
      return new Response(
        JSON.stringify({ 
          error: 'Challenge not found',
          details: challengeError?.message || 'Invalid challenge ID'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already has a master submission for this challenge
    const { data: existingMaster, error: existingError } = await supabase
      .from('submissions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .is('onboarding_step_id', null)
      .is('parent_submission_id', null)
      .single()

    let masterSubmissionId;

    if (existingMaster && !existingError) {
      // Update existing master submission
      const { data: updatedMaster, error: updateError } = await supabase
        .from('submissions')
        .update({
          status: 'pending_review'
          // Remove updated_at - let Supabase handle this automatically
        })
        .eq('id', existingMaster.id)
        .select('id')
        .single()

      if (updateError) {
        console.error('Error updating master submission:', updateError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update master submission',
            details: updateError.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      masterSubmissionId = updatedMaster.id
    } else {
      // Create new master submission
      const { data: masterSubmission, error: masterError } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          status: 'pending_review',
          submission_type: 'onboarding_complete',
          submission_data: {
            type: 'onboarding_completion',
            completedAt: new Date().toISOString(),
            challengeTitle: challengeData.title
          }
          // Remove created_at and updated_at - let Supabase handle these automatically
        })
        .select('id')
        .single()

      if (masterError) {
        console.error('Error creating master submission:', masterError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create master submission',
            details: masterError.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      masterSubmissionId = masterSubmission.id
    }

    // Find all individual step submissions for this user and challenge
    const { data: stepSubmissions, error: stepError } = await supabase
      .from('submissions')
      .select('id, onboarding_step_id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .not('onboarding_step_id', 'is', null)
      .is('parent_submission_id', null)

    if (stepError) {
      console.error('Error fetching step submissions:', stepError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch step submissions',
          details: stepError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update each step submission to link to the master submission
    if (stepSubmissions && stepSubmissions.length > 0) {
      const stepIds = stepSubmissions.map(sub => sub.id)
      
      const { error: linkError } = await supabase
        .from('submissions')
        .update({
          parent_submission_id: masterSubmissionId
          // Remove updated_at - let Supabase handle this automatically
        })
        .in('id', stepIds)

      if (linkError) {
        console.error('Error linking step submissions:', linkError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to link step submissions',
            details: linkError.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Onboarding completed successfully',
        masterSubmissionId,
        linkedStepSubmissions: stepSubmissions?.length || 0,
        challengeTitle: challengeData.title
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
