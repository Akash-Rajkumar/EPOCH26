import { supabase } from '../lib/supabase.js';
import crypto from 'crypto';

function generateStackHash(stackTrace) {
  if (!stackTrace) return null;

  return crypto
    .createHash('sha256')
    .update(stackTrace)
    .digest('hex')
    .slice(0, 16); // short hash
}

export async function testConnection() {
  const { data, error } = await supabase.from('crashes').select('*').limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected:", data);
  }
}
export async function saveChain(crashId, chain) {
  if (!chain || chain.length === 0) return;

  const formatted = chain.map((step) => ({
    crash_id: crashId,
    step_index: step.step_index,
    mutation_type: step.mutation_type,
    input_snapshot: step.input_snapshot || null,
    generation: step.generation || 0
  }));

  const { error } = await supabase.from('chains').insert(formatted);

  if (error) {
    console.error("❌ saveChain error:", error.message);
  } else {
    console.log("✅ Chain saved");
  }
}

export async function saveCrash(event) {
  const stack_hash = generateStackHash(event.stack_trace);

  const { data: existing } = await supabase
    .from('crashes')
    .select('*')
    .eq('stack_hash', stack_hash)
    .maybeSingle();

  if (existing) {
    console.log("⚠️ Duplicate crash detected, skipping...");
    return { crash: existing, isNew: false };
  }

  const { data, error } = await supabase
    .from('crashes')
    .insert({
      session_id: event.session_id,
      input_raw: event.input_raw,
      input_minimised: event.input_minimised || null,
      crash_type: event.crash_type,
      severity: event.severity,
      stack_trace: event.stack_trace || null,
      stack_hash
    })
    .select()
    .single();

  if (error) {
    console.error("❌ DB ERROR:", error.message);
    return null;
  }

  console.log("✅ New unique crash stored:", data.id);
  return { crash: data, isNew: true };
}