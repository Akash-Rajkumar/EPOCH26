import { supabase } from '../lib/supabase.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

export async function saveCrash(event) {
  const stack_hash = crypto
    .createHash('sha256')
    .update(event.stack_trace || event.input_raw || '')
    .digest('hex')
    .slice(0, 16);

  const { data: existing } = await supabase
    .from('crashes')
    .select('id')
    .eq('stack_hash', stack_hash)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('⚠️ Duplicate crash skipped');
    return null;
  }

  const crashId = uuid();

  const { data, error } = await supabase
    .from('crashes')
    .insert({
      id: crashId,
      session_id: event.session_id,
      input_raw: event.input_raw,
      crash_type: event.crash_type,
      severity: event.severity,
      stack_trace: event.stack_trace,
      stack_hash,
      exit_code: event.exit_code || null,
      signal_code: event.signal_code || null,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error saving crash:', error);
    return null;
  }

  return data;
}

export async function saveChain(crashId, chain) {
  if (!chain || !chain.length) return;

  const rows = chain.map((step, index) => ({
    crash_id: crashId,
    step_index: step.step_index ?? index,
    generation: step.generation ?? index,
    mutation_type: step.mutation_type,
    input_snapshot: step.input_snapshot || null,
    parent_id: null,
  }));

  const { error } = await supabase.from('chains').insert(rows);

  if (error) {
    console.error('❌ Error saving chain:', error);
  }
}

export async function updateSession(sessionId, metrics) {
  const { error } = await supabase
    .from('sessions')
    .upsert({
      id: sessionId,
      total_inputs: metrics.inputs,
      coverage_pct: metrics.coverage,
      unique_bugs: metrics.crashes,
      status: 'running',
    });

  if (error) {
    console.error('❌ Error updating session:', error);
  }
}