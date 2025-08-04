import { config } from 'dotenv';

config();

async function quickHealthCheck() {
  console.log('🏥 Quick Health Check for Supabase Edge Functions\n');

  // Check environment variables
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    return;
  }
  
  console.log('✅ Environment variables present');

  // Test basic connectivity
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    console.log('🔍 Testing Supabase connectivity...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { 'apikey': anonKey }
    });
    
    if (response.ok) {
      console.log('✅ Supabase API accessible');
    } else {
      console.log(`❌ Supabase API error: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Connection failed:', error);
  }

  // Test AI Agent function
  try {
    console.log('🤖 Testing AI Agent function...');
    const response = await fetch(`${supabaseUrl}/functions/v1/AI_Agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        prompt: 'Write a short test article about renewable energy',
        sources: ['https://example.com/renewable-energy'],
        tone: 'neutral',
        style: 'journalistic',
        length: 'short'
      })
    });

    console.log(`📊 AI Agent response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('✅ AI Agent function is working');
      
      // Try to read the response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log('📄 Response preview:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      } else if (contentType?.includes('text/')) {
        const text = await response.text();
        console.log('📄 Response preview:', text.substring(0, 200) + '...');
      } else {
        console.log('📄 Response type:', contentType);
      }
    } else {
      const error = await response.text();
      console.log('❌ AI Agent function error');
      console.log('📄 Error details:', error);
      
      // Try to parse error as JSON for better formatting
      try {
        const errorJson = JSON.parse(error);
        console.log('🔍 Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch {
        // Error is not JSON, already logged above
      }
    }
  } catch (error) {
    console.log('❌ AI Agent test failed:', error);
  }
}

quickHealthCheck().catch(console.error);