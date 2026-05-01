export async function generateTriage(crash) {
  // 🔁 Mock for now (no external API yet)
  return {
    hypothesis: "Likely null pointer dereference due to missing validation",
    root_cause_category: "null_deref",
    suggested_fix: "Add null checks before dereferencing pointer",
    confidence: "medium"
  };
}