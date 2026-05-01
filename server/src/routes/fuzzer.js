import { Router } from 'express';
import { startFuzzer, stopFuzzer } from '../services/fuzzerProcess.js';
import { v4 as uuid } from 'uuid';

const router = Router();
let currentSessionId = null;

router.post('/start', (req, res) => {
  try {
    currentSessionId = uuid();

    startFuzzer({
      sessionId: currentSessionId
    });

    res.json({
      status: 'fuzzer started',
      sessionId: currentSessionId
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/stop', (req, res) => {
  stopFuzzer();
  res.json({ status: 'fuzzer stopped' });
});

export default router;