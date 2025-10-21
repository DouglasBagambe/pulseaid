"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("1");
  const [mode, setMode] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Set default deadline to 7 days from now if not set
    if (!deadline) {
      const defaultDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      const defaultDateStr = new Date(defaultDeadline * 1000).toISOString().slice(0, 16);
      setDeadline(defaultDateStr);
    }
  }, [deadline]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !goal || !deadline || !creatorEmail) {
      alert("Please fill all required fields including email");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(creatorEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const fd = new FormData();
      
      fd.append("title", title);
      fd.append("description", description);
      fd.append("goal", goal);
      fd.append("mode", mode);
      fd.append("beneficiary", address); // Add beneficiary (connected wallet)
      fd.append("creatorEmail", creatorEmail);
      
      // Convert datetime-local to Unix timestamp
      const deadlineDate = new Date(deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);
      fd.append("deadline", deadlineTimestamp.toString());
      
      if (file) {
        fd.append("proof", file);
      }

      const res = await axios.post(`${base}/api/campaigns`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(`Campaign created successfully! ID: ${res.data?.campaign?._id}`);
      router.push("/");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to create campaign: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

  function handleDeadlineChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDeadline(e.target.value);
  }

  // Show wallet connection prompt if not connected
  if (mounted && !isConnected) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to create a campaign. This wallet will be set as the beneficiary address.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Don't render the form until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-[#35D07F]/20 border-t-[#35D07F] rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#35D07F]/10 via-[#0B1020] to-[#FCFF52]/10 border-b border-white/10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#35D07F]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FCFF52]/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 mb-4">
            <svg className="w-4 h-4 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-[#35D07F]">New Campaign</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FCFF52] to-[#35D07F] bg-clip-text text-transparent">
            Create Your Campaign
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-4">
            Share your story and get help from the community. All campaigns are AI-verified and reviewed for authenticity.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span>Connected:</span>
            <span className="font-mono text-[#35D07F]">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={submit} className="space-y-6">
            {/* Campaign Title */}
            <div className="relative group">
              <label className="block text-sm font-semibold mb-3 text-white">
                Campaign Title <span className="text-[#35D07F]">*</span>
              </label>
              <input
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500"
                placeholder="e.g., Help Sarah Fight Cancer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="relative group">
              <label className="block text-sm font-semibold mb-3 text-white">
                Campaign Story
              </label>
              <textarea
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500 min-h-[140px] resize-none"
                placeholder="Tell your story... Why do you need help? How will the funds be used? Be honest and detailed to build trust with donors."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                A compelling story helps donors connect with your cause
              </p>
            </div>

            {/* Two Column Layout for Goal and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funding Goal */}
              <div className="relative group">
                <label className="block text-sm font-semibold mb-3 text-white">
                  Funding Goal <span className="text-[#35D07F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl pl-5 pr-16 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500"
                    placeholder="1.0"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    CELO
                  </div>
                </div>
              </div>

              {/* Campaign Type */}
              <div className="relative group">
                <label className="block text-sm font-semibold mb-3 text-white">
                  Campaign Type <span className="text-[#35D07F]">*</span>
                </label>
                <select
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white appearance-none cursor-pointer"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  required
                >
                  <option value="0" className="bg-[#0E1726]">💛 Pure Kindness</option>
                  <option value="1" className="bg-[#0E1726]">🛡️ Goal-Based (Escrow)</option>
                </select>
                <svg className="absolute right-5 top-[58%] pointer-events-none text-gray-400" width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Campaign Type Info */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/10 to-[#FCFF52]/10 rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#35D07F]/20 to-[#FCFF52]/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {mode === "0"
                        ? "💛 Pure Kindness: All donations go directly to you, even if the goal isn't reached. Perfect for urgent needs."
                        : "🛡️ Escrow Mode: Funds are held in smart contract. If goal isn't met by deadline, donors get automatic refunds. Builds more trust for large goals."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="relative group">
              <label className="block text-sm font-semibold mb-3 text-white">
                Your Email Address <span className="text-[#35D07F]">*</span>
              </label>
              <input
                type="email"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white placeholder-gray-500"
                placeholder="your@email.com"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                We&apos;ll notify you when your campaign is approved or if there are any issues
              </p>
            </div>

            {/* Deadline */}
            <div className="relative group">
              <label className="block text-sm font-semibold mb-3 text-white">
                Campaign Deadline <span className="text-[#35D07F]">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#35D07F] focus:bg-white/10 transition-all duration-300 text-white"
                value={deadline}
                onChange={handleDeadlineChange}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Set any deadline for your campaign
              </p>
            </div>

            {/* Proof Document Upload */}
            <div className="relative group">
              <label className="block text-sm font-semibold mb-3 text-white">
                Proof Document <span className="text-gray-400">(Optional)</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-[#35D07F] bg-[#35D07F]/10"
                    : "border-white/10 bg-white/5 hover:border-[#35D07F]/50 hover:bg-white/10"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] flex items-center justify-center mx-auto shadow-lg">
                        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-[#35D07F] mb-1">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <p className="text-xs text-gray-500">Click or drag to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-300 font-medium mb-1">Drop your file here or click to browse</p>
                        <p className="text-xs text-gray-500">Hospital letter, medical report, receipt, or any proof document</p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <span>PDF, JPG, PNG</span>
                        <span>•</span>
                        <span>Max 10MB</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2AB56F] text-black font-semibold hover:shadow-lg hover:shadow-[#35D07F]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Campaign...
                  </span>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </div>
          </form>

          {/* Process Info */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/20 to-[#FCFF52]/20 rounded-2xl blur-2xl" />
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-white">What Happens Next?</h3>
                </div>
              </div>
              <ol className="space-y-3 ml-14">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] text-xs font-bold">1</span>
                  <span>Your proof document is securely uploaded to IPFS (decentralized storage)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] text-xs font-bold">2</span>
                  <span>AI system analyzes and verifies the authenticity of your documents</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] text-xs font-bold">3</span>
                  <span>Admin team reviews your campaign (typically within 24 hours)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] text-xs font-bold">4</span>
                  <span>Once approved, your campaign goes live on Celo blockchain</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#35D07F]/20 flex items-center justify-center text-[#35D07F] text-xs font-bold">5</span>
                  <span>Earn badge NFTs as donors support your cause!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}