#!/bin/bash
# Deploy to Vercel - run this from your terminal
# Prerequisites: npm install -g vercel && vercel login

echo "🚀 Deploying NERV SIGNAL FOR JCI to Vercel..."
cd "$(dirname "$0")/.."

# Login (uncomment if not logged in)
# vercel login

# Deploy to production
vercel --prod --yes

echo "✅ Deploy complete!"
