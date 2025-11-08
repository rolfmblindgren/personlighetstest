import React from "react";
import { t as tr } from "@/i18n";

export default function GDPR() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{tr('privacyTitle')}</h1>
      <p className="mb-4">
	{tr('privacyP1')}
      </p>
      <p className="mb-4">
	{tr('privacyP2')}

      </p>
      <p className="mb-4">
	{tr('privacyP3')}

      </p>
      <p className="mt-8 text-sm text-gray-600">
	{tr('privacyP4')}

      </p>
    </div>
  );
}
