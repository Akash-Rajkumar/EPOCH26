import { generateLLMTriage } from "./llmTriage.js";

export async function generateTriage(crash) {

  // 🔥 TRY LLM FIRST (PRIMARY)
  try {
    console.log("🧠 Using LLM as primary engine...");

    const llm = await generateLLMTriage(crash);

    if (llm) {
      return {
        ...llm,
        source: "llm_primary"
      };
    }

  } catch (err) {
    console.log("⚠️ LLM failed, switching to fallback");
  }

  // 🧱 FALLBACK (YOUR OLD LOGIC)
  const { crash_type, stack_trace = "", severity } = crash;

  let hypothesis = "";
  let root_cause_category = "";
  let suggested_fix = "";
  let confidence = "medium";

  const trace = stack_trace.toLowerCase();

  if (crash_type === "null_deref" || trace.includes("null")) {
    hypothesis = "Null pointer dereference caused by accessing uninitialized memory.";
    root_cause_category = "null_deref";
    suggested_fix = "Add null checks and validate memory references before access.";
    confidence = "high";
  } 
  else if (crash_type === "heap_overflow" || trace.includes("overflow")) {
    hypothesis = "Heap buffer overflow due to unsafe memory write.";
    root_cause_category = "buffer_overflow";
    suggested_fix = "Introduce bounds checking and safe memory handling functions.";
    confidence = "high";
  } 
  else if (trace.includes("segmentation fault")) {
    hypothesis = "Segmentation fault likely caused by invalid memory access.";
    root_cause_category = "memory_violation";
    suggested_fix = "Inspect pointer usage and ensure valid memory allocation.";
    confidence = "medium";
  } 
  else {
    hypothesis = "Unknown crash pattern detected.";
    root_cause_category = "unknown";
    suggested_fix = "Perform manual debugging using stack trace.";
    confidence = "low";
  }

  return {
    hypothesis,
    root_cause_category,
    suggested_fix,
    confidence,
    source: "fallback_logic"
  };
}