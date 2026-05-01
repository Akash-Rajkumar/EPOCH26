import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Crashes from "./pages/Crashes";
import ChainViewer from "./pages/ChainViewer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/crashes" element={<Crashes />} />
        <Route path="/crash/:id" element={<ChainViewer />} />
      </Routes>
    </BrowserRouter>
  );
}