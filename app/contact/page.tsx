export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-gray-900 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white border rounded-3xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-black">Contact Us</h1>

        <p className="text-gray-500 mt-3">
          Need help with Jobify.cv? Contact us below.
        </p>

        <div className="mt-8 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <h2 className="font-bold text-lg text-blue-700">Email support</h2>
            <p className="text-gray-700 mt-2">
              muhammedsherminjust@gmail.com
            </p>
          </div>

          <div className="bg-slate-50 border rounded-2xl p-5">
            <h2 className="font-bold text-lg">Response time</h2>
            <p className="text-gray-600 mt-2">
              We aim to respond as soon as possible.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}