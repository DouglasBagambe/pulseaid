"use client";
import React, { useState } from "react";
import axios from "axios";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("1");
  const [mode, setMode] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const base =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const fd = new FormData();
      fd.append("title", title);
      fd.append("goal", goal);
      fd.append("mode", mode);
      fd.append("deadline", deadline);
      if (file) fd.append("proof", file);
      const res = await axios.post(`${base}/createCampaign`, fd);
      alert("Created: " + res.data?.campaign?._id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>
      <div className="space-y-3 max-w-md">
        <input
          className="w-full bg-gray-800 rounded-xl px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full bg-gray-800 rounded-xl px-3 py-2"
          placeholder="Goal (CELO)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <select
          className="w-full bg-gray-800 rounded-xl px-3 py-2"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="0">Kindness</option>
          <option value="1">Escrow</option>
        </select>
        <input
          className="w-full bg-gray-800 rounded-xl px-3 py-2"
          placeholder="Deadline (unix seconds)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-[#00C2A8] text-black"
          onClick={submit}
        >
          Create
        </button>
      </div>
    </div>
  );
}
