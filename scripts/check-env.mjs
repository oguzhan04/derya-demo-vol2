#!/usr/bin/env node

// Test script to check environment variables
console.log('🔍 Checking environment variables...\n');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('BLOB_READ_WRITE_TOKEN:', BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Missing');

if (OPENAI_API_KEY) {
  console.log('OpenAI Key format:', OPENAI_API_KEY.startsWith('sk-') ? '✅ Valid format' : '⚠️  Unexpected format');
}

if (BLOB_READ_WRITE_TOKEN) {
  console.log('Blob Token format:', BLOB_READ_WRITE_TOKEN.length > 20 ? '✅ Valid format' : '⚠️  Unexpected format');
}

console.log('\n📋 What each variable does:');
console.log('• OPENAI_API_KEY: Powers AI brief generation and document embeddings');
console.log('• BLOB_READ_WRITE_TOKEN: Stores/retrieves RAG indexes in Vercel Blob (optional)');

console.log('\n🚀 Next steps:');
if (!OPENAI_API_KEY) {
  console.log('1. Get OpenAI API key from: https://platform.openai.com/api-keys');
}
if (!BLOB_READ_WRITE_TOKEN) {
  console.log('2. BLOB_READ_WRITE_TOKEN (optional):');
  console.log('   - Create Blob store in Vercel Dashboard → Storage');
  console.log('   - Get token from blob store settings');
  console.log('   - Or skip for now - APIs work without it');
}
console.log('3. Add variables to Vercel project settings');
console.log('4. Redeploy your project');
