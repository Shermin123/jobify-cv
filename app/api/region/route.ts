import { NextResponse } from "next/server";

const lowCostCountries = [
  // South Asia
  "IN", // India
  "PK", // Pakistan
  "BD", // Bangladesh
  "NP", // Nepal
  "LK", // Sri Lanka

  // Southeast Asia
  "PH", // Philippines
  "ID", // Indonesia
  "VN", // Vietnam
  "KH", // Cambodia
  "MM", // Myanmar

  // Africa
  "NG", // Nigeria
  "KE", // Kenya
  "GH", // Ghana
  "UG", // Uganda
  "TZ", // Tanzania
  "ZA", // South Africa
  "EG", // Egypt
  "MA", // Morocco

  // Other price-sensitive markets
  "TR", // Turkey
  "BR", // Brazil
  "MX", // Mexico
];

const ukCountries = [
  "GB",
  "UK",
];

function normalizeCountryCode(countryCode: string | null) {
  return String(countryCode || "").trim().toUpperCase();
}

function getRegion(countryCode: string) {
  const code = normalizeCountryCode(countryCode);

  if (ukCountries.includes(code)) {
    return "UK";
  }

  if (lowCostCountries.includes(code)) {
    return "LOW";
  }

  return "DEFAULT";
}

export async function GET(req: Request) {
  const countryCode = normalizeCountryCode(
    req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      "GB"
  );

  const region = getRegion(countryCode);

  return NextResponse.json({
    country: countryCode,
    countryCode,
    region,
  });
}