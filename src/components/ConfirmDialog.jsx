import React from "react";

export default function ConfirmDialog({ open, count, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Bekreft sletting
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Er du helt sikker på at du vil slette{" "}
          <span className="font-semibold text-gray-800">{count}</span>{" "}
          test{count === 1 ? "" : "er"}?
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            onClick={onCancel}
          >
            Avbryt
          </button>
          <button
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            onClick={onConfirm}
          >
            Slett
          </button>
        </div>
      </div>
    </div>
  );
}
