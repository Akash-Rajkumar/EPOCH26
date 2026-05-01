import { spawn } from 'child_process';
import { io } from '../index.js';

let fuzzerProcess = null;

export function startFuzzer() {
  if (fuzzerProcess) {
    throw new Error('Fuzzer already running');
  }

  // IMPORTANT: adjust path if needed
  fuzzerProcess = spawn('python', ['../fuzzer/mock_fuzzer.py']);

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

function handleEvent(event) {
  console.log('📩 EVENT:', event);

  // send to frontend (future)
  io.emit('fuzzer_event', event);
}