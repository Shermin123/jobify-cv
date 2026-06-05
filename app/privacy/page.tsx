export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-gray-900 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white border rounded-3xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-black">Privacy Policy</h1>

        <p className="text-gray-500 mt-3">
          Last updated: June 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700 leading-7">
          <p>
            Jobify.cv helps users create AI-generated CVs, cover letters, ATS keywords,
            and related career documents.
          </p>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Information we collect</h2>
            <p className="mt-2">
              We may collect your name, email address, login details, CV text, job description text,
              generated CVs, cover letters, keywords, and usage information.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">How we use your information</h2>
            <p className="mt-2">
              We use your information to provide CV generation, improve our service,
              manage accounts, process subscriptions, and support users.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Payments</h2>
            <p className="mt-2">
              Payments may be handled by Stripe. We do not store full card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Contact</h2>
            <p className="mt-2">
              For privacy questions, contact us at muhammedsherminjust@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}