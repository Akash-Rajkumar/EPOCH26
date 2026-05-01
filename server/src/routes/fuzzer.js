import { Router } from 'express';
import { startFuzzer, stopFuzzer } from '../services/fuzzerProcess.js';

const router = Router();

router.post('/start', (req, res) => {
  try {
    startFuzzer();
    res.json({ status: 'fuzzer started' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/stop', (req, res) => {
  stopFuzzer();
  res.json({ status: 'fuzzer stopped' });
});

export default router;