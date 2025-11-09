# Auto-Pipeline Testing Guide

This guide helps verify that the auto-pipeline feature works correctly for demo purposes.

## Pre-Flight Checks

### 1. Verify Auto-Pipeline is Enabled
```bash
# Start server with auto-pipeline enabled
AUTO_PIPELINE=true npm run dev:server

# Check console output - should see:
# 🚀 AI Employee API server running on http://localhost:3001
# 📧 Starting email watcher...
```

### 2. Verify Auto-Pipeline is Disabled (Graceful Disable)
```bash
# Start server WITHOUT auto-pipeline
npm run dev:server

# Send an email with arrival notice
# Check console - should see:
# ⏸️  AUTO_PIPELINE disabled, skipping automatic progression
# No automatic phase progression should occur
```

## Test Scenarios

### Test 1: Single Email → Full Lifecycle ✅
**Goal**: Verify one email triggers complete auto-pipeline

**Steps**:
1. Start server: `AUTO_PIPELINE=true npm run dev:server`
2. Send one arrival notice email with PDF attachment
3. Watch Mission Log and shipment pipeline

**Expected Results**:
- Mission Log shows:
  - `[Intake] Ops AI processed arrival notice from email for container XXXX`
  - `[Compliance] FreightBot Alpha Cleared compliance checks for XXXX`
  - `[Monitoring] FreightBot Alpha Started ETA tracking for XXXX`
  - `[Arrival & Delivery] FreightBot Alpha Processed arrival and delivery for XXXX`
  - `[Billing & Close-Out] FreightBot Alpha Completed billing and close-out for XXXX`
- Shipment pipeline counters increment: Intake → Compliance → Monitoring → Arrival → Billing
- All phases complete in ~15 seconds
- Employee metrics update (tasks executed, last activity)

### Test 2: Duplicate Email (Same Container) ✅
**Goal**: Verify duplicate emails don't restart pipeline

**Steps**:
1. Start server: `AUTO_PIPELINE=true npm run dev:server`
2. Send arrival notice email with container `MAEU1234567`
3. Wait 5 seconds
4. Send another email with the SAME container `MAEU1234567`

**Expected Results**:
- First email triggers auto-pipeline (all phases run)
- Second email updates the shipment but does NOT restart auto-pipeline
- Console shows: `⏭️  [AUTO-PIPELINE] Shipment MAEU1234567 is already in auto-pipeline, skipping duplicate run`
- Only ONE set of phase progression events in Mission Log

### Test 3: Multiple Different Emails ✅
**Goal**: Verify multiple emails run independently

**Steps**:
1. Start server: `AUTO_PIPELINE=true npm run dev:server`
2. Send arrival notice email #1 with container `MAEU1111111`
3. Wait 5 seconds
4. Send arrival notice email #2 with container `TCLU2222222`

**Expected Results**:
- Both emails trigger independent auto-pipelines
- Mission Log shows phase events for BOTH containers
- Shipment pipeline shows both shipments progressing
- No interference between the two pipelines
- Both complete successfully

### Test 4: Server Restart Mid-Pipeline ⚠️
**Goal**: Understand behavior if server restarts during auto-pipeline

**Steps**:
1. Start server: `AUTO_PIPELINE=true npm run dev:server`
2. Send arrival notice email
3. Wait 3 seconds (mid-pipeline)
4. Restart server (Ctrl+C, then restart)

**Expected Results**:
- Auto-pipeline does NOT resume (this is expected - pipelines are in-memory)
- Shipment remains at the last completed phase
- This is acceptable for demo purposes (real production would need persistence)

**Note**: For production, you'd want to persist pipeline state to a database and resume on restart.

## Demo Script (45-60 seconds)

### Opening (10s)
> "When an arrival notice hits the inbox, FreightBot Alpha not only parses it – it runs the entire shipment lifecycle autonomously: intake, compliance, monitoring, arrival, and billing. What you're seeing here is that 15-second autonomous workflow."

### Point to Screen (35-45s)
1. **Mission Log** (10s)
   - "Watch the Mission Log stream – you'll see each phase complete automatically"
   - Point to: `[Monitoring] Started ETA tracking`, `[Arrival] Processed arrival and delivery`

2. **Shipment Pipeline** (10s)
   - "The shipment pipeline counters update in real-time"
   - Point to: Intake → Compliance → Monitoring → Arrival → Billing counters

3. **Metrics** (10s)
   - "Performance metrics update live – processing velocity, tasks executed, cost saved"
   - Point to: Decision Confidence bar, Tasks Executed counter

4. **Wrap-up** (5s)
   - "All of this happens automatically from a single email – no human intervention required."

## Troubleshooting

### Auto-pipeline not starting?
- Check `AUTO_PIPELINE=true` is set
- Verify email has PDF attachment
- Check console for: `🚀 [AUTO-PIPELINE] Starting automatic progression`
- Ensure shipment is NEW (not an update to existing container)

### Duplicate pipelines running?
- Check console for duplicate prevention message
- Verify `activeAutoPipelines` Set is working (should see cleanup messages)

### Phases not progressing?
- Check console for phase completion messages
- Verify frontend is polling (check Network tab for `/api/ai-actions` requests)
- Ensure no JavaScript errors in browser console

