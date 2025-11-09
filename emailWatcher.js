import imap from 'imap-simple'
import { simpleParser } from 'mailparser'

/**
 * Email Watcher for Arrival Notices
 * 
 * Polls an IMAP inbox for new arrival notice emails and processes PDF attachments
 * automatically, feeding them into the shipment pipeline.
 */

// Email status tracking
export const emailStatus = {
  connected: false,
  lastConnectAt: null,
  lastPollAt: null,
  lastError: null,
}

let isWatching = false
let watchInterval = null
let lastProcessedUid = null
let processedUids = new Set() // Track processed email UIDs to avoid reprocessing

/**
 * Process arrival notice buffer (shared with upload endpoint)
 * This function is imported from server.js
 */
let processArrivalNoticeBuffer = null

export function setProcessArrivalNoticeBuffer(fn) {
  processArrivalNoticeBuffer = fn
}

/**
 * Connect to IMAP server and watch for new emails
 */
async function watchForEmails() {
  if (!processArrivalNoticeBuffer) {
    console.warn('Email watcher: processArrivalNoticeBuffer not set, skipping email check')
    return
  }

  const config = {
    imap: {
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT) || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    }
  }

  const mailbox = process.env.IMAP_MAILBOX || 'INBOX'

  try {
    const connection = await imap.connect(config)
    await connection.openBox(mailbox)
    
    // Update status on successful connection
    emailStatus.connected = true
    emailStatus.lastConnectAt = new Date()
    emailStatus.lastError = null

    // Search for UNSEEN messages only (cleaner for demo - no reprocessing spam)
    let searchCriteria = ['UNSEEN']
    
    // Optionally filter by subject containing 'arrival notice' (case insensitive)
    if (process.env.IMAP_FILTER_SUBJECT === 'true') {
      searchCriteria.push(['SUBJECT', 'arrival notice'])
    }

    // Search with full message body (BODY[] = empty string in bodies array)
    // This gets the complete RFC822 message including headers and attachments
    const fetchOptions = {
      bodies: [''],  // Empty string = BODY[] = full raw message
      struct: true
    }
    
    let messages = await connection.search(searchCriteria, fetchOptions)

    // Update last poll time
    emailStatus.lastPollAt = new Date()
    
    if (messages.length === 0) {
      await connection.end()
      return
    }

    console.log(`📧 Found ${messages.length} new arrival notice email(s)`)

    // Process messages sequentially to avoid connection issues
    for (const message of messages) {
      let uid = null
      try {
        uid = message.attributes.uid
        
        // Skip if already processed (to avoid reprocessing same emails)
        if (processedUids.has(uid)) {
          continue
        }
        
        // Get the RFC822 body from the search results
        // When using bodies: 'RFC822', the body should be in message.parts
        let rawEmail = null
        
        // Look for the RFC822 part in the message parts
        // When using bodies: [''], the part with which === '' is the full raw message
        const rfc822Part = message.parts?.find(p => p.which === '' || !p.which)
        
        if (rfc822Part && rfc822Part.body) {
          rawEmail = Buffer.isBuffer(rfc822Part.body) 
            ? rfc822Part.body 
            : Buffer.from(rfc822Part.body, 'utf8')
          console.log(`✅ Found RFC822 in parts for UID ${uid}`)
        } else if (message.parts && message.parts.length > 0) {
          // Fallback: try first part
          const firstPart = message.parts[0]
          if (firstPart.body) {
            rawEmail = Buffer.isBuffer(firstPart.body) 
              ? firstPart.body 
              : Buffer.from(firstPart.body, 'utf8')
            console.log(`✅ Found body in first part for UID ${uid}`)
          }
        }
        
        if (!rawEmail || rawEmail.length === 0) {
          console.log(`⚠️  No RFC822 body in search results for uid ${uid}, trying getPartData with BODY[]...`)
          
          // Fallback: use getPartData with empty string (BODY[])
          try {
            rawEmail = await connection.getPartData(message, { which: '' })
            if (rawEmail && !Buffer.isBuffer(rawEmail)) {
              rawEmail = Buffer.from(rawEmail, 'utf8')
            }
            console.log(`✅ getPartData with '' succeeded for UID ${uid}`)
          } catch (getPartError) {
            console.error(`❌ getPartData with '' failed for UID ${uid}:`, getPartError.message)
            
            // Last resort: try with 'RFC822'
            try {
              rawEmail = await connection.getPartData(message, { which: 'RFC822' })
              if (rawEmail && !Buffer.isBuffer(rawEmail)) {
                rawEmail = Buffer.from(rawEmail, 'utf8')
              }
              console.log(`✅ getPartData with 'RFC822' succeeded for UID ${uid}`)
            } catch (getPartError2) {
              console.error(`❌ getPartData with 'RFC822' also failed for UID ${uid}:`, getPartError2.message)
            }
          }
        }
        
        if (!rawEmail || rawEmail.length === 0) {
          console.log(`⚠️  Could not fetch raw email for uid ${uid} - all methods failed`)
          if (uid) {
            await connection.addFlags(uid, '\\Seen')
          }
          continue
        }
        
        console.log(`📦 Got raw email for UID ${uid}, ${rawEmail.length} bytes`)
        
        // Process the email
        await processEmailMessage(rawEmail, uid, connection)
        
      } catch (emailError) {
        console.error('Error processing email:', emailError)
        if (uid) {
          try {
            await connection.addFlags(uid, '\\Seen')
          } catch (flagError) {
            console.error('Could not mark email as seen:', flagError)
          }
        }
      }
    }

    await connection.end()

  } catch (error) {
    console.error('Email watcher error:', error.message)
    emailStatus.connected = false
    emailStatus.lastError = error.message
  }
}

// Helper function to process a fetched email message
async function processEmailMessage(rawEmail, uid, connection) {
  try {
    // Parse the email with mailparser
    const parsed = await simpleParser(rawEmail)

    // Log email subject
    const subject = parsed.subject || 'No subject'
    console.log(`📧 [EMAIL] Found new email: ${subject}`)

    // Find PDF attachment
    let pdfBuffer = null
    
    if (parsed.attachments && parsed.attachments.length > 0) {
      // Find first PDF attachment
      const pdfAttachment = parsed.attachments.find(att => 
        att.contentType === 'application/pdf' || 
        att.filename?.toLowerCase().endsWith('.pdf')
      )
      
      if (pdfAttachment) {
        pdfBuffer = pdfAttachment.content
        const filename = pdfAttachment.filename || 'unnamed.pdf'
        console.log(`📄 [ATTACHMENT] Found PDF: ${filename}`)
      }
    }

    if (!pdfBuffer) {
      console.log('⚠️  No PDF attachment found in email, skipping')
      console.log(`   Email has ${parsed.attachments?.length || 0} attachment(s)`)
      if (parsed.attachments && parsed.attachments.length > 0) {
        console.log(`   Attachments: ${parsed.attachments.map(a => a.filename || a.contentType).join(', ')}`)
      }
      await connection.addFlags(uid, '\\Seen')
      return
    }

    console.log(`📄 Processing PDF attachment from email (${pdfBuffer.length} bytes)`)

    // Prepare email metadata
    const emailMetadata = {
      subject: parsed.subject || 'No subject',
      from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown sender',
      receivedAt: parsed.date ? new Date(parsed.date).toISOString() : new Date().toISOString(),
      attachmentName: pdfAttachment.filename || 'unnamed.pdf',
      attachmentSize: pdfBuffer.length
    }

    // Process the arrival notice with email metadata
    const result = await processArrivalNoticeBuffer(pdfBuffer, 'email', 'application/pdf', emailMetadata)

    if (result && result.shipment) {
      console.log(`✅ Successfully processed arrival notice from email for container ${result.shipment.containerNo}`)
      
      // Mark as processed
      processedUids.add(uid)
      
      // Mark email as seen/processed
      await connection.addFlags(uid, '\\Seen')
      
      // Optionally move to processed folder
      if (process.env.IMAP_PROCESSED_FOLDER) {
        try {
          await connection.moveMessage(uid, process.env.IMAP_PROCESSED_FOLDER)
          console.log(`📁 Moved email to ${process.env.IMAP_PROCESSED_FOLDER}`)
        } catch (moveError) {
          console.warn('Could not move email to processed folder:', moveError.message)
          // Not critical - email is already marked as seen and tracked
        }
      }
    } else {
      console.error('❌ Failed to process arrival notice from email')
    }
  } catch (error) {
    console.error('Error in processEmailMessage:', error)
    throw error
  }
}

/**
 * Start watching for emails
 */
export function startEmailWatcher() {
  if (isWatching) {
    console.log('Email watcher already running')
    return
  }

  // Check if IMAP config is provided
  if (!process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
    console.log('⚠️  Email watcher: IMAP_USER and IMAP_PASSWORD not set, skipping email watch')
    emailStatus.connected = false
    emailStatus.lastError = 'IMAP credentials not configured'
    return
  }

  const pollInterval = parseInt(process.env.IMAP_POLL_INTERVAL) || 60000 // Default 60 seconds

  console.log(`📧 Starting email watcher (checking every ${pollInterval / 1000}s)`)
  
  isWatching = true
  
  // Initialize status
  emailStatus.connected = false
  emailStatus.lastError = null
  
  // Run immediately on start
  watchForEmails()
  
  // Then poll at interval
  watchInterval = setInterval(watchForEmails, pollInterval)
  
  console.log('✅ Email watcher started')
}

/**
 * Stop watching for emails
 */
export function stopEmailWatcher() {
  if (!isWatching) {
    return
  }
  
  if (watchInterval) {
    clearInterval(watchInterval)
    watchInterval = null
  }
  
  isWatching = false
  console.log('🛑 Email watcher stopped')
}

