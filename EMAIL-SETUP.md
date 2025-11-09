# Email Watcher Setup Guide

## Overview

The email watcher automatically processes arrival notice emails and feeds them into the shipment pipeline. When a new email arrives with a PDF attachment, it:

1. Downloads the PDF
2. Extracts data using OpenAI
3. Creates/updates the shipment
4. Runs compliance checks
5. Adds actions to the activity feed

## Environment Variables

Add these to your `.env` file or set them as environment variables:

```bash
# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_MAILBOX=INBOX

# Optional Configuration
IMAP_POLL_INTERVAL=60000          # Poll every 60 seconds (default)
IMAP_FILTER_SUBJECT=true          # Only process emails with "arrival notice" in subject
IMAP_PROCESSED_FOLDER=Processed   # Move processed emails to this folder (optional)
```

## Gmail Setup

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Step Verification

### 2. Generate App Password
- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)"
- Enter "Derya AI Email Watcher"
- Copy the generated 16-character password
- Use this as `IMAP_PASSWORD` (not your regular Gmail password)

### 3. Test Connection

The email watcher will start automatically when the server starts. Check the console logs:

```
📧 Starting email watcher (checking every 60s)
✅ Email watcher started
```

If you see errors, check:
- IMAP credentials are correct
- App password is valid
- IMAP is enabled in Gmail settings

## How It Works

1. **Polling**: Checks for new emails every 60 seconds (configurable)
2. **Filtering**: Only processes emails with "arrival notice" in subject (if `IMAP_FILTER_SUBJECT=true`)
3. **Processing**: Extracts first PDF attachment and processes it
4. **Marking**: Marks emails as "seen" to avoid reprocessing
5. **Moving**: Optionally moves processed emails to a "Processed" folder

## Troubleshooting

### Email watcher not starting
- Check that `IMAP_USER` and `IMAP_PASSWORD` are set
- Verify the app password is correct (not your regular password)

### Emails not being processed
- Check console logs for errors
- Verify emails have PDF attachments
- Ensure subject contains "arrival notice" (if filtering enabled)
- Check that emails are marked as "unseen"

### Connection errors
- Verify IMAP is enabled in Gmail
- Check firewall/network settings
- Try using `IMAP_HOST=imap.gmail.com` explicitly

## Security Notes

- **Never commit** `.env` files with real credentials
- Use app passwords, not your main Gmail password
- Consider using a dedicated email account for testing
- The email watcher only reads emails, never sends them

