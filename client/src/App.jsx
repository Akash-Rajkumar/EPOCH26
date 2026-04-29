import { useState } from "react";
import React from "react";

const API = "http://localhost:5000";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");

  const testAPI = async () => {
    const res = await fetch(`${API}/api/test`);
    const data = await res.json();
    setResponse(data.message);
  };

  const login = async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  const sendData = async () => {
    const res = await fetch(`${API}/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: "Hello from frontend 🚀" })
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 Hackathon Starter</h1>

      <button onClick={testAPI}>Test API</button>

      <h2>Login</h2>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>

      <h2>Send Data</h2>
      <button onClick={sendData}>Send</button>

      <pre>{response}</pre>
    </div>
  );
}
