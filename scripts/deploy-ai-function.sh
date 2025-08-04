#!/usr/bin/env bash

# Deploy AI Agent Edge Function to Supabase
echo "🚀 Deploying AI Agent Edge Function"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not installed. Install with: npm install -g @supabase/cli"
    exit 1
fi

# Check if function exists
if [ ! -f "supabase/functions/AI_Agent/index.ts" ]; then
    echo "❌ AI_Agent function not found in supabase/functions/AI_Agent/"
    exit 1
fi

echo "📦 Deploying..."
supabase functions deploy AI_Agent --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🧪 Test with: npm run health-check"
else
    echo "❌ Deployment failed"
    exit 1
fi
