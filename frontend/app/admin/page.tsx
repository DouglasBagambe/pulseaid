"use client";
import React from "react";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Admin</h2>
      <AdminPanel />
    </div>
  );
}
