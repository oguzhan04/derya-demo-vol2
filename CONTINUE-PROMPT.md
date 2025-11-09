# Continuation Prompt for Next Chat Session

## Context
I'm working on an email-to-shipment pipeline for a freight forwarding dashboard. The system should automatically process arrival notice emails with PDF attachments and create shipments.

## Current Status

### ✅ What's Working
- Email watcher connects to Gmail IMAP (`info@usederya.com`)
- Email status endpoint `/api/email/status` is working and displayed in UI
- Email watcher polls every 60 seconds
- Checks last hour OR last 5 emails (for testing)
- Server is running on port 3001
- All logging is in place

### ❌ Current Issue
**Email processing is failing** - The email watcher finds emails but can't extract PDF attachments.

**Error Details:**
- `getPartData` only returns 121 bytes (just the email body text, not full RFC822)
- Mailparser gets incomplete message: "No subject", "0 attachment(s)"
- Tried using `connection.search(['UID', uid], { bodies: 'RFC822', struct: true })` but still not getting full message

**What we need:**
- Fetch the complete RFC822 raw email message (with headers + attachments)
- Currently only getting the text body (121 bytes)
- Need the full message so mailparser can extract PDF attachments

## Files Modified
- `emailWatcher.js` - Email watcher with RFC822 fetch attempts
- `server.js` - Added email status endpoint, dotenv config
- `src/features/agents/ManageAgents.jsx` - Added email status badge in Ops AI card

## Next Steps Needed
1. **Fix RFC822 message fetching** - Need to get complete raw email, not just body text
2. **Test with real email** - Once RFC822 works, verify PDF extraction
3. **Verify end-to-end** - Check that shipments are created and UI updates

## Environment
- Server: `npm run dev:server` (port 3001)
- Email: `info@usederya.com` (Gmail, IMAP configured)
- Test email: "Arrival Notice for Container ABC123" with PDF attachment exists in inbox

## Key Code Locations
- Email fetching: `emailWatcher.js` lines 155-190 (`fetchFullRFC822` function)
- Email processing: `emailWatcher.js` lines 192-259 (`processEmailMessage` function)
- Main watcher: `emailWatcher.js` lines 37-153 (`watchForEmails` function)

---

**Prompt to use in next chat:**

"I'm working on an email-to-shipment pipeline. The email watcher connects to Gmail and finds emails, but when trying to fetch the full RFC822 message to extract PDF attachments, it only gets 121 bytes (just the text body) instead of the complete message with attachments. 

The current code uses `connection.search(['UID', uid], { bodies: 'RFC822', struct: true })` from imap-simple, but mailparser receives an incomplete message with no subject and 0 attachments.

I need help fixing the RFC822 message fetching so we get the complete raw email (headers + body + attachments) that mailparser can properly parse. The email exists in the inbox with a PDF attachment, but we're not getting it.

Check `emailWatcher.js` - the `fetchFullRFC822` function around line 156 needs to be fixed to return the complete RFC822 message."

