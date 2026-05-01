import { spawn } from 'child_process';
import { io } from '../index.js';
import {
  saveCrash,
  saveChain,
  updateSession
} from './supabaseService.js';
import { generateTriage } from './llmTriage.js';
import { saveTriage } from './supabaseService.js';

let fuzzerProcess = null;
let currentSessionId = null;

export function startFuzzer({ sessionId }) {
  if (fuzzerProcess) {
    throw new Error('Fuzzer already running');
  }
  currentSessionId = sessionId;
  // IMPORTANT: adjust path if needed
  fuzzerProcess = spawn('python', [
        '-B',
        '-m',
        'fuzzer.main',
        '--target',
        'python target/parser.py'
    ],
    {
        cwd: '../'  // 🔥 THIS FIXES EVERYTHING
    }
    );

  let buffer = '';

  fuzzerProcess.stdout.on('data', (chunk) => {
        buffer += chunk.toString();

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // ❗ Skip non-JSON lines (like "Reduced → ...")
            if (!trimmed.startsWith('{')) {
            console.log('ℹ️ Skipped non-JSON:', trimmed);
            continue;
            }

            try {
            const raw = JSON.parse(trimmed);
            const event = normalizeEvent(raw);

            if (event) {
                handleEvent(event);
            }
            } catch (err) {
            console.error('❌ JSON parse error:', trimmed);
            }
        }
    });

  fuzzerProcess.stderr.on('data', (data) => {
    console.error('⚠️ Fuzzer error:', data.toString());
  });

  fuzzerProcess.on('exit', (code, signal) => {
    console.log(`🛑 Fuzzer stopped. Code: ${code}, Signal: ${signal}`);
  });
}

export function stopFuzzer() {
  if (fuzzerProcess) {
    fuzzerProcess.kill('SIGTERM');
    fuzzerProcess = null;
  }
}


function normalizeEvent(raw) {
  const type = raw.event;

  if (type === 'session_start') {
    return {
      type: 'session_start',
      session_id: raw.session_id
    };
  }

  if (type === 'metrics') {
    return {
      type: 'metrics',
      inputs: raw.iteration ?? 0,
      crashes: raw.unique_crashes ?? 0,
      coverage: 0 // M1 doesn't provide yet
    };
  }

  if (type === 'crash') {
    return {
      type: 'crash',
      session_id: raw.session_id,
      input_raw: raw.input_raw,
      stack_trace: raw.stack_trace,
      crash_type: raw.crash_type,
      severity: raw.severity,
      chain: [] // will be filled separately
    };
  }

  if (type === 'chain') {
    return {
      type: 'chain',
      crash_id: raw.crash_id,
      step_index: raw.step_index,
      generation: raw.generation,
      mutation_type: raw.mutation_type,
      input_snapshot: raw.input_snapshot
    };
  }

  return null;
}


async function handleEvent(event) {
  console.log('📩 EVENT:', event);

  // Send to frontend
  io.emit('fuzzer_event', event);

  if (event.type === 'chain') {
    await saveChain(event.crash_id, [event]);
    return;
  }

  if (event.type === 'crash') {
    const crash = await saveCrash(event);

    if (crash?.id) {
        await saveChain(crash.id, event.chain);

        // 🔥 Phase 4 — Triage hook
        (async () => {
            try {
                console.log("🧠 Calling LLM...");

                const triage = await generateTriage(crash);

                console.log("🧠 TRIAGE RESULT:", triage);

                await saveTriage(crash.id, triage);

            } catch (err) {
                console.error("❌ Triage failed:", err.message);
            }
        })();
    }
  }

  if (currentSessionId && event.type === 'metrics') {
    await updateSession(currentSessionId, event);
  }
}