import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/api/test", (req, res) => {
  res.json({ message: "API working ✅" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.post("/api/data", async (req, res) => {
  const { content } = req.body;

  const { data, error } = await supabase
    .from("logs")
    .insert([{ content }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Stored successfully", data });
});

app.listen(5000, () => console.log("Server running on 5000 🚀"));
