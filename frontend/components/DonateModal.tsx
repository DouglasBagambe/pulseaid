import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => void;
};

export default function DonateModal({ open, onClose, onConfirm }: Props) {
  const [amount, setAmount] = useState("1");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#0E1726] w-full max-w-sm rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3">Donate</h3>
        <div className="flex gap-2 mb-3">
          {["0.1", "0.5", "1", "2"].map((v) => (
            <button
              key={v}
              className="px-3 py-2 bg-gray-700 rounded-xl text-white"
              onClick={() => setAmount(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <input
          className="w-full bg-gray-800 text-white rounded-xl px-3 py-2 mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-xl bg-gray-700 text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-[#00C2A8] text-black"
            onClick={() => onConfirm(amount)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
