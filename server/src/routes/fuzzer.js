import { Router } from 'express';

const router = Router();

// Start fuzzer (placeholder for now)
router.post('/start', (req, res) => {
  res.json({ status: 'fuzzer start placeholder' });
});

// Stop fuzzer
router.post('/stop', (req, res) => {
  res.json({ status: 'fuzzer stop placeholder' });
});

export default router;