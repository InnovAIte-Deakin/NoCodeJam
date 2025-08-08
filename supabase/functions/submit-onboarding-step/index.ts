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

    // Parse the request body
    const { challengeId, stepId, submissionData } = await req.json()
    
    // Validate required fields
    if (!challengeId) {
      return new Response(
        JSON.stringify({ error: 'challengeId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!stepId) {
      return new Response(
        JSON.stringify({ error: 'stepId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!submissionData || typeof submissionData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'submissionData must be a valid object' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate that the challenge exists
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('id')
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

    // Validate that the onboarding step exists
    const { data: stepData, error: stepError } = await supabase
      .from('onboarding_steps')
      .select('id, step_number, title')
      .eq('id', stepId)
      .single()

    if (stepError || !stepData) {
      return new Response(
        JSON.stringify({ 
          error: 'Onboarding step not found',
          details: stepError?.message || 'Invalid step ID'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already has a submission for this step
    const { data: existingSubmission, error: existingError } = await supabase
      .from('submissions')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .eq('onboarding_step_id', stepId)
      .single()

    // If there's an existing submission, update it instead of creating a new one
    if (existingSubmission && !existingError) {
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('submissions')
        .update({
          submission_data: submissionData,
          status: 'completed_step',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('Database update error:', updateError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update submission',
            details: updateError.message 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Submission updated successfully',
          submission: updatedSubmission,
          stepInfo: {
            stepNumber: stepData.step_number,
            stepTitle: stepData.title
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create new submission record
    const { data: newSubmission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        onboarding_step_id: stepId,
        submission_data: submissionData,
        status: 'completed_step',
        submission_type: 'onboarding_step',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create submission',
          details: insertError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Submission created successfully',
        submission: newSubmission,
        stepInfo: {
          stepNumber: stepData.step_number,
          stepTitle: stepData.title
        }
      }),
      { 
        status: 201,
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
