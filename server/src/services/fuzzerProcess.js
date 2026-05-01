import { spawn } from 'child_process';
import { io } from '../index.js';
import {
  saveCrash,
  saveChain,
  updateSession
} from './supabaseService.js';

let fuzzerProcess = null;

export function startFuzzer({ sessionId }) {
  if (fuzzerProcess) {
    throw new Error('Fuzzer already running');
  }

  // IMPORTANT: adjust path if needed
  fuzzerProcess = spawn('python', ['../fuzzer/mock_fuzzer.py', sessionId]);

  let buffer = '';

  fuzzerProcess.stdout.on('data', (chunk) => {
    buffer += chunk.toString();

    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete JSON

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const event = JSON.parse(line);
        handleEvent(event);
      } catch (err) {
        console.error('❌ JSON parse error:', line);
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

async function handleEvent(event) {
  console.log('📩 EVENT:', event);

  // Send to frontend
  io.emit('fuzzer_event', event);

  if (event.type === 'crash') {
    const crash = await saveCrash(event);

    if (crash?.id) {
      await saveChain(crash.id, event.chain);
    }
  }

  if (event.type === 'metrics') {
    await updateSession(event.session_id || 'test-session', event);
  }
}