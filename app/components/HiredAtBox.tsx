export default function HiredAtBox() {
  const companies = [
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      name: "Meta",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.png",
    },
    {
      name: "Netflix",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      name: "Apple",
      text: "Apple",
    },
    {
      name: "IBM",
      text: "IBM",
    },
    {
      name: "Deloitte",
      text: "Deloitte",
    },
  ];

  return (
    <div className="mt-6 w-full max-w-[620px] mx-auto">
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg p-4">
        <div className="text-center">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
            Trusted by job seekers
          </p>

          <h3 className="mt-1 text-base font-black text-gray-900">
            Our users apply to top companies
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {companies.map((company) => (
            <div
              key={company.name}
              className="h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center px-3 shadow-sm"
            >
              {"logo" in company ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-5 max-w-[82px] object-contain"
                />
              ) : (
                <span className="text-sm font-black text-gray-700">
                  {company.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}