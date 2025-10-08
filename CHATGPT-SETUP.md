# ChatGPT API Setup Guide

## Option 1: Environment File (.env)

Create a `.env` file in the project root with:

```bash
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_actual_api_key_here
```

## Option 2: In-App Configuration

1. Go to the app in your browser
2. Look for API key configuration in the settings
3. Enter your OpenAI API key there

## Getting Your API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add it to your `.env` file or app configuration

## Testing the Setup

Once configured, you should see in the browser console:

- ✅ "ChatGPT API key found. Full document processing enabled."

Without the API key, you'll see:

- ⚠️ "ChatGPT API key not configured. Document processing will use fallback methods."

## Fallback Mode

Even without ChatGPT, the app will:

- Extract information from filenames
- Classify documents based on name patterns
- Auto-fill form fields with basic information
- Save documents to the correct categories

## Troubleshooting

If you're still having issues:

1. Check the browser console for error messages
2. Verify your API key is valid
3. Ensure you have credits in your OpenAI account
4. Check your internet connection
