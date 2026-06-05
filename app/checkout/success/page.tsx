"use client";

import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white border rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="text-5xl">✅</div>

        <h1 className="text-3xl font-black mt-4 text-gray-900">
          Payment successful
        </h1>

        <p className="text-gray-500 mt-3">
          Your Jobify subscription payment was completed successfully.
        </p>

        <button
          onClick={() => router.push("/upload")}
          className="mt-6 w-full bg-black text-white py-3 rounded-2xl font-bold hover:bg-gray-800"
        >
          Go to AI CV Studio
        </button>

        <button
          onClick={() => router.push("/my-documents")}
          className="mt-3 w-full border py-3 rounded-2xl font-bold hover:bg-gray-50 text-gray-800"
        >
          View My Documents
        </button>
      </div>
    </main>
  );
}
