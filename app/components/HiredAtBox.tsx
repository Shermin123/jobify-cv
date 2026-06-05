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
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      name: "IBM",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    },
    {
      name: "Deloitte",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
    },
  ];

  return (
    <div className="mt-6 w-full max-w-[620px] mx-auto">
      <div className="rounded-3xl bg-white border border-gray-200 shadow-lg p-4">

        <div className="text-center">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
            Trusted by job seekers
          </p>

          <h3 className="mt-1 text-base font-black text-gray-900">
            Our customers are working here
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {companies.map((company) => (
            <div
              key={company.name}
              className="h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center px-3 shadow-sm"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="max-h-5 max-w-[82px] object-contain"
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}