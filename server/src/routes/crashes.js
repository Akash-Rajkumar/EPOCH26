import { Router } from 'express';

const router = Router();

// Get all crashes (placeholder)
router.get('/', (req, res) => {
  res.json({ crashes: [] });
});

export default router;