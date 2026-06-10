import { NextResponse } from "next/server";

const lowCostCountries = [
  "IN",
  "PK",
  "BD",
  "NP",
  "LK",
  "PH",
  "ID",
  "VN",
  "NG",
  "KE",
  "GH",
  "ZA",
  "EG",
  "MA",
  "TR",
  "BR",
  "MX",
];

export async function GET(req: Request) {
  const countryCode =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "GB";

  let region = "DEFAULT";

  if (countryCode === "GB") {
    region = "UK";
  } else if (lowCostCountries.includes(countryCode)) {
    region = "LOW";
  }

  return NextResponse.json({
    countryCode,
    region,
  });
}