import Groq from "groq-sdk";



const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function cleanText(text) {
  if (!text) return text;

  return text
    // remove specific function assumptions cleanly
    .replace(/in the main\(\) function/gi, "in the code")
    .replace(/main\(\)/gi, "the execution flow")

    // fix awkward phrases
    .replace(/in the code in the code/gi, "in the code")
    .replace(/the code in the code/gi, "the code")
    .replace(/in the code to ensure/gi, "to ensure")

    // general cleanup
    .replace(/the the/gi, "the")
    .replace(/\s+/g, " ")
    .trim();
}

  function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1));
    }
  } catch (err) {
    console.log("JSON parse failed");
  }

  return null;
}

export async function generateTriage(crash) {
const prompt = `
You are a senior security engineer specializing in crash analysis and vulnerability triage.

Your job is to deeply analyze crashes and provide precise, technical explanations like a real expert.

---

Example:

Crash Type: null_deref
Stack Trace: Segmentation fault

Response:
{
  "hypothesis": "Null pointer dereference caused by accessing an uninitialized or freed pointer during execution",
  "root_cause_category": "null_deref",
  "suggested_fix": "Ensure all pointers are properly initialized before use and add null checks before dereferencing",
  "confidence": "high"
}



---

Now analyze the following crash:

Crash Type: ${crash.crash_type}
Stack Trace: ${crash.stack_trace}

Instructions:
- Be specific and technical
- Mention WHY the crash happens
- Provide a realistic fix developers can apply
- Do NOT hallucinate unknown details
- Do NOT assume function names or code locations unless explicitly present in the stack trace

Respond ONLY in valid JSON:

{
  "hypothesis": "clear technical explanation",
  "root_cause_category": "specific category",
  "suggested_fix": "actionable fix",
  "confidence": "high | medium | low"
}
`;
try {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
   messages: [
  {
    role: "system",
    content: "You are a strict JSON generator. You MUST return only valid JSON with no extra text."
  },
  {
    role: "user",
    content: prompt
  }
],
    temperature: 0.2
  });





  console.log("FULL RESPONSE:", response);

  const text = response.choices[0]?.message?.content || "";
  console.log("LLM TEXT:", text);



    // Extract JSON safely
   const parsed = extractJSON(text);

if (parsed) {
  parsed.hypothesis = cleanText(parsed.hypothesis);
  parsed.suggested_fix = cleanText(parsed.suggested_fix);
}

return parsed;

  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    return null;
  }
}