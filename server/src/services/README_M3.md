# 🚀 FuzzForge — M3 Data & Intelligence Layer

## 👨‍💻 Owner

Akash (M3 Engineer)

---

# 🧠 PURPOSE

Handles:

* Crash storage (Supabase)
* Mutation chain tracking
* Intelligent triage (rule-based AI)
* Deduplication (unique bug detection)

---

# 🔗 SYSTEM FLOW

Fuzzer (M1) → Backend (M2) → **M3 Layer** → Supabase → Frontend (M4)

---

# 📦 SERVICES PROVIDED

## 1. saveCrash(event)

### Description:

* Stores crash in DB
* Generates `stack_hash`
* Detects duplicates

### Returns:

```json
{
  "crash": {...},
  "isNew": true | false
}
```

### Behavior:

* If duplicate → skips insert
* If new → stores crash

---

## 2. saveChain(crashId, chain)

Stores mutation lineage steps.

---

## 3. triggerTriage(crash)

### Description:

* Local AI (rule-based)
* Classifies crash type
* Generates:

  * hypothesis
  * root cause
  * suggested fix

---

## 4. updateSession(sessionId, metrics)

(Planned — not yet implemented)

---

# 🧠 DEDUPLICATION LOGIC

Uses:

```text
stack_hash = SHA256(stack_trace)
```

### Behavior:

* Same stack → same bug
* Duplicate crashes ignored
* Only unique bugs processed

---

# 📥 REQUIRED INPUT FORMAT (FROM M2)

```json
{
  "type": "crash",
  "session_id": "uuid",
  "input_raw": "hex",
  "stack_trace": "string",
  "crash_type": "null_deref",
  "severity": "high",
  "chain": [...]
}
```

---

# 📊 DATABASE TABLES

## crashes

Stores unique crashes

## chains

Stores mutation lineage

## triage_notes

Stores AI analysis

---

# 📤 DATA FOR FRONTEND (M4)

M4 will query Supabase directly:

```js
// crashes
supabase.from('crashes').select('*')

// chains
supabase.from('chains').eq('crash_id', id)

// triage
supabase.from('triage_notes').eq('crash_id', id)
```

---

# ⚠️ TEAM CONTRACT

## M1

* Must output valid JSON
* Must include chain

## M2

* Must NOT modify event structure
* Must call M3 services only
* Must NOT access DB directly

## M4

* Must read from Supabase
* Must handle missing triage gracefully

---

# 🧪 CURRENT STATUS

* [x] Supabase connected
* [x] Crash storage working
* [x] Chain storage working
* [x] Local AI triage working
* [x] Deduplication implemented
* [ ] Full M2 integration pending
* [ ] Sessions tracking pending

---

# 🧠 KEY FEATURE

> “We detect and analyze **unique bugs**, not just crashes.”

---

# 🚧 NEXT STEPS

* Integrate with M2 live fuzzer stream
* Add session tracking
* Add frontend visualization (M4)
