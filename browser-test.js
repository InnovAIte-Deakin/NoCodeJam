// Test script to run in browser console to test Edge Function directly
console.log('=== Testing Edge Function Directly ===');

async function testEdgeFunction() {
  try {
    // This will run in the browser context with the same environment
    const response = await fetch('https://sulcylvskbtobhbkpkte.supabase.co/functions/v1/get-onboarding-steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token') || 'no-token'}`
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log('Edge Function Response:');
    console.log('- Status:', response.status);
    console.log('- Data:', data);
    
    return data;
  } catch (error) {
    console.error('Edge Function test error:', error);
  }
}

testEdgeFunction();
