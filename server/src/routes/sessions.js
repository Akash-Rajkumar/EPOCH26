import { Router } from 'express';

const router = Router();

// Get all sessions (placeholder)
router.get('/', (req, res) => {
  res.json({ sessions: [] });
});

export default router;