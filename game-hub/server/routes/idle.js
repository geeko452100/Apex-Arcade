import { Router } from 'express';
import { createUserSupabase } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/save', requireAuth, async (req, res) => {
  const supabase = createUserSupabase(req.accessToken);

  const { data, error } = await supabase
    .from('idle_saves')
    .select('save_data, updated_at')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (!data?.save_data) {
    return res.json({ data: null });
  }

  res.json({
    data: {
      saveData: data.save_data,
      updatedAt: data.updated_at,
    },
  });
});

router.put('/save', requireAuth, async (req, res) => {
  const { saveData } = req.body ?? {};

  if (!saveData || typeof saveData !== 'object') {
    return res.status(400).json({ error: 'saveData is required' });
  }

  const supabase = createUserSupabase(req.accessToken);
  const { error } = await supabase
    .from('idle_saves')
    .upsert(
      {
        user_id: req.user.id,
        save_data: saveData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
});

export default router;
