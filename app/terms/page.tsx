export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-gray-900 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white border rounded-3xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-black">Terms of Service</h1>

        <p className="text-gray-500 mt-3">
          Last updated: June 2026
        </p>

        <div className="mt-8 space-y-6 text-gray-700 leading-7">
          <p>
            By using Jobify.cv, you agree to these terms.
          </p>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Service</h2>
            <p className="mt-2">
              Jobify.cv provides AI-assisted CV, cover letter, ATS keyword, and career document tools.
              We do not guarantee job interviews, job offers, or employment.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">User responsibility</h2>
            <p className="mt-2">
              You are responsible for checking and editing any AI-generated content before submitting
              it to employers.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Subscriptions</h2>
            <p className="mt-2">
              Paid plans may renew automatically unless cancelled. Trial details and billing terms
              will be shown before checkout.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-xl text-gray-900">Contact</h2>
            <p className="mt-2">
              For support, contact muhammedsherminjust@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}