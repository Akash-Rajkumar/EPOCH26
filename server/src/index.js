import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabase.js";
import { testConnection } from "./services/supabaseService.js";
import { generateTriage } from './services/triageService.js';
import { generateLLMTriage } from "./services/llmTriage.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔍 Test DB connection
testConnection();

console.log("ENV CHECK:", process.env.SUPABASE_URL);

// ✅ Basic test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working ✅" });
});

app.get("/test-llm", async (req, res) => {
  const sampleCrash = {
    crash_type: "null_deref",
    stack_trace: "Segmentation fault at 0x00000000 in main()"
  };

  const result = await generateLLMTriage(sampleCrash);

  console.log("LLM RESULT:", result);

  res.json(result || { error: "LLM failed" });
});

app.get('/api/test-triage', async (req, res) => {
  const fakeCrash = {
    crash_type: "null_deref",
    severity: "high",
    stack_trace: "Segmentation fault"
  };

  try {
    const triage = await generateTriage(fakeCrash);

    res.json({
      success: true,
      triage
    });
  } catch (err) {
    console.error("❌ Triage error:", err.message);

    res.status(500).json({
      success: false,
      error: "Triage failed"
    });
  }
});

// ❌ REMOVE auth + logs routes for now (not needed)

// 🚀 Start server
app.listen(5000, () => {
  console.log("Server running on 5000 🚀");
});