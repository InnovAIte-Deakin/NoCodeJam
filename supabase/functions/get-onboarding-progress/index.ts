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

  // Only allow GET requests
  if (req.method !== 'GET') {
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

    // Get the onboarding challenge ID
    // For now, we'll assume there's a challenge with a specific type or name for onboarding
    // You may need to adjust this query based on your actual challenge structure
    let { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('id')
      .eq('challenge_type', 'onboarding')
      .single()

    if (challengeError) {
      // If no specific onboarding challenge type, try to get the first challenge as fallback
      const { data: fallbackChallenge, error: fallbackError } = await supabase
        .from('challenges')
        .select('id')
        .limit(1)
        .single()

      if (fallbackError || !fallbackChallenge) {
        return new Response(
          JSON.stringify({ 
            error: 'Onboarding challenge not found',
            details: challengeError?.message || 'No challenges available'
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      challengeData = fallbackChallenge
    }

    // Query user's completed onboarding submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        onboarding_step_id,
        status,
        created_at,
        onboarding_steps (
          id,
          step_number,
          title
        )
      `)
      .eq('user_id', user.id)
      .eq('challenge_id', challengeData.id)
      .eq('status', 'completed_step')
      .not('onboarding_step_id', 'is', null)
      .order('created_at', { ascending: false })

    if (submissionsError) {
      console.error('Database error:', submissionsError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch onboarding progress',
          details: submissionsError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process submissions to get completed step information
    const completedSteps = submissions?.map(submission => ({
      stepId: submission.onboarding_step_id,
      stepNumber: submission.onboarding_steps?.step_number,
      stepTitle: submission.onboarding_steps?.title,
      completedAt: submission.created_at
    })).filter(step => step.stepNumber !== null) || []

    // Find the highest completed step number
    const highestCompletedStep = completedSteps.length > 0 
      ? Math.max(...completedSteps.map(step => step.stepNumber))
      : 0

    // The current step is the one after the highest completed step
    const currentStepNumber = highestCompletedStep + 1

    // Get list of completed step IDs for easy lookup
    const completedStepIds = completedSteps.map(step => step.stepId)

    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        challengeId: challengeData.id,
        completedSteps,
        completedStepIds,
        highestCompletedStep,
        currentStepNumber,
        totalCompletedSteps: completedSteps.length
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
