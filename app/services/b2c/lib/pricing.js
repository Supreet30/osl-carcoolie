// Pricing engine for the /services/b2c flow. Reference data (cities,
// routes, add-ons, coupons) is fetched from Supabase when it's configured
// (see lib/supabaseClient.js) and supabase-schema.sql has been applied —
// every fetcher below falls back to the same hardcoded dummy data this
// started as if Supabase isn't reachable, so the demo never breaks.

import { isSupabaseConfigured, supabase } from "../../../../lib/supabaseClient";

export const CITIES = [
  { name: "Delhi", state: "Delhi" },
  { name: "Chandigarh", state: "Chandigarh" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Bangalore", state: "Karnataka" },
];

// Groups a {name, state}[] list (CITIES, or getCities()'s live result) by
// state for the pickup/destination pickers — a city with no state (added
// before that column existed, or left blank) groups under "Other" instead
// of being dropped. Shape matches what Dropdown.js/CityDropdown.js expect
// for grouped options: [{ label, options: string[] }].
export function groupCitiesByState(cities) {
  const groups = new Map();
  for (const c of cities) {
    const key = c.state || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c.name);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, names]) => ({ label, options: names.sort((a, b) => a.localeCompare(b)) }));
}

// First 2 digits of an Indian PIN code map (roughly) to these 4 demo cities.
// Kept local/synchronous — it's a cheap heuristic run on every keystroke on
// the hero pincode fields, not worth a network round trip.
const PINCODE_PREFIXES = {
  Delhi: ["11"],
  Chandigarh: ["16"],
  Mumbai: ["40"],
  Bangalore: ["56"],
};

export function cityFromPincode(pincode) {
  const prefix = (pincode || "").trim().slice(0, 2);
  const match = Object.entries(PINCODE_PREFIXES).find(([, prefixes]) => prefixes.includes(prefix));
  return match ? match[0] : null;
}

// One entry per unordered city pair — { distanceKm, basePrice, minDays } for
// the "forward" direction as written. The reverse direction's price is
// derived (backhaul legs are conventionally a little cheaper); minDays is
// shared both ways here since this is just the offline fallback — the real
// `routes` table (supabase-schema.sql) stores distance/price/min_days
// per-direction, independently admin-editable.
const LOCAL_ROUTES = [
  { a: "Delhi", b: "Chandigarh", distanceKm: 250, basePrice: 6000, minDays: 1 },
  { a: "Delhi", b: "Mumbai", distanceKm: 1400, basePrice: 20000, minDays: 3 },
  { a: "Delhi", b: "Bangalore", distanceKm: 2150, basePrice: 28000, minDays: 4 },
  { a: "Chandigarh", b: "Mumbai", distanceKm: 1600, basePrice: 21500, minDays: 4 },
  { a: "Chandigarh", b: "Bangalore", distanceKm: 2400, basePrice: 30000, minDays: 5 },
  { a: "Mumbai", b: "Bangalore", distanceKm: 980, basePrice: 15000, minDays: 2 },
];

const BACKHAUL_MULTIPLIER = 0.97;

function getLocalRoute(fromCity, toCity) {
  if (!fromCity || !toCity || fromCity === toCity) return null;
  const route = LOCAL_ROUTES.find(
    (r) => (r.a === fromCity && r.b === toCity) || (r.a === toCity && r.b === fromCity)
  );
  if (!route) return null;
  const isForward = route.a === fromCity;
  return {
    fromCity,
    toCity,
    distanceKm: route.distanceKm,
    price: Math.round(isForward ? route.basePrice : route.basePrice * BACKHAUL_MULTIPLIER),
    minDays: route.minDays,
  };
}

// Multiplier applied on top of the whole pre-tax estimate (route + vehicle
// type + add-ons) when the customer's vehicle make is in the admin's
// "Luxury Makes" list — matches carcoolie-admin's luxury_settings.load_factor,
// which is what getLuxuryLoadFactor() below actually reads; this is only the
// offline fallback for when Supabase isn't configured/reachable.
export const LUXURY_LOAD_FACTOR = 1.2;

// Route prices in the `routes` table (and the local fallback) are stored
// exclusive of GST, so it's computed and added here rather than baked into
// those numbers.
export const GST_RATE = 0.18;

// Flat fee added when the customer opts for a CarCoolie driver (instead of
// self drop-off/pickup) on either leg — covers the driver making a special
// trip to the customer's location rather than the hub. Each leg is
// independent: choosing a driver for both pickup and drop-off adds both.
export const DRIVER_PICKUP_CHARGE = 1000;
export const DRIVER_DROPOFF_CHARGE = 1000;

// Vehicle type changes the price via a multiplier on the route's base
// transportation price, not a flat rupee amount — so the surcharge scales
// with distance (a longer, pricier route gets a bigger SUV surcharge, a
// short route a smaller one). 1.0 = no change (Sedan baseline); below 1.0
// is a discount (Hatchback); above 1.0 is a surcharge. The actual rupee
// surcharge added on top of route.price is computed in computeEstimate()
// as route.price * (priceMultiplier - 1).
export const VEHICLE_TYPES = [
  { name: "Hatchback", priceMultiplier: 0.9 },
  { name: "Sedan", priceMultiplier: 1.0 },
  { name: "SUV", priceMultiplier: 1.15 },
  { name: "Luxury Sedan", priceMultiplier: 1.3 },
  { name: "Luxury SUV", priceMultiplier: 1.45 },
  { name: "Sports", priceMultiplier: 1.6 },
];

// Make/Model catalog for the "Get an Estimate" modal's Make and Model
// dropdowns — no free text. Picking a Model looks up its vehicleType here
// and sets that automatically, instead of asking the customer to also pick
// a Vehicle Type themselves. Matches the vehicle_models seed data in
// supabase-schema.sql; admin-editable from the "Vehicle Models" page.
export const VEHICLE_MODELS = [
  { make: "Maruti Suzuki", model: "Swift", vehicleType: "Hatchback" },
  { make: "Hyundai", model: "i20", vehicleType: "Hatchback" },
  { make: "Hyundai", model: "Verna", vehicleType: "Sedan" },
  { make: "Volkswagen", model: "Virtus", vehicleType: "Sedan" },
  { make: "Toyota", model: "Fortuner", vehicleType: "SUV" },
  { make: "Ford", model: "Endeavour", vehicleType: "SUV" },
  { make: "BMW", model: "5 Series", vehicleType: "Luxury Sedan" },
  { make: "Mercedes-Benz", model: "S Class", vehicleType: "Luxury Sedan" },
  { make: "Mercedes-Benz", model: "GLS", vehicleType: "Luxury SUV" },
  { make: "Audi", model: "Q7", vehicleType: "Luxury SUV" },
  { make: "Ford", model: "Mustang", vehicleType: "Sports" },
  { make: "Audi", model: "R8", vehicleType: "Sports" },
];

export const ADD_ON_SERVICES = [
  { key: "guaranteedDate", label: "Guaranteed Date", subtitle: "Priority scheduling", price: 1500 },
  { key: "insurance", label: "Insurance", subtitle: "Additional coverage", price: 800 },
  { key: "carWash", label: "Car Wash", subtitle: "Professional cleaning", price: 700 },
];

const LOCAL_COUPONS = {
  WELCOME5: { type: "percent", value: 5, label: "5% off" },
};

function validateCouponLocal(code) {
  const coupon = LOCAL_COUPONS[(code || "").trim().toUpperCase()];
  return coupon ? { code: code.trim().toUpperCase(), ...coupon } : null;
}

// ---- Live (Supabase-backed) fetchers, each with a local fallback ----

// Every fetcher below only falls back to the local dummy data when Supabase
// isn't configured, or the query itself errored (network/RLS/schema issue)
// — NOT merely when the table came back empty. A configured, reachable
// Supabase with zero rows (e.g. an admin deleted everything) is a real
// state to reflect as empty, not something to paper over with fake demo
// data; `!error && data?.length` used to conflate the two.
export async function getCities() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("cities").select("name, state").eq("is_active", true).order("name");
    if (!error) return data.map((c) => ({ name: c.name, state: c.state || null }));
  }
  return CITIES;
}

export async function getAddOnServices() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("add_on_services")
      .select("key, label, subtitle, price")
      .eq("is_active", true)
      .order("created_at");
    if (!error) return data;
  }
  return ADD_ON_SERVICES;
}

export async function getVehicleTypes() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("vehicle_types")
      .select("name, price_multiplier")
      .eq("is_active", true)
      .order("price_multiplier");
    if (!error) return data.map((v) => ({ name: v.name, priceMultiplier: Number(v.price_multiplier) }));
  }
  return VEHICLE_TYPES;
}

export async function getVehicleModels() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("vehicle_models")
      .select("make, model, vehicle_type:vehicle_type_id(name)")
      .eq("is_active", true)
      .order("make")
      .order("model");
    if (!error) return data.map((v) => ({ make: v.make, model: v.model, vehicleType: v.vehicle_type?.name ?? null }));
  }
  return VEHICLE_MODELS;
}

export async function getRoute(fromCity, toCity) {
  if (!fromCity || !toCity || fromCity === toCity) return null;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("routes")
      .select("distance_km, base_price, min_days, from_city:from_city_id(name), to_city:to_city_id(name)")
      .eq("is_active", true);
    if (!error) {
      const match = data.find((r) => r.from_city?.name === fromCity && r.to_city?.name === toCity);
      return match
        ? {
            fromCity,
            toCity,
            distanceKm: match.distance_km,
            price: Math.round(match.base_price),
            minDays: match.min_days ?? 1,
          }
        : null;
    }
  }
  return getLocalRoute(fromCity, toCity);
}

// Case-insensitive — the make typed/picked in the estimate form doesn't
// necessarily match the casing of whatever's in the admin's luxury_makes
// table (e.g. "maruti" vs "Maruti" both exist as separate catalog rows).
export async function isLuxuryMake(make) {
  if (!make || !isSupabaseConfigured) return false;
  const { data, error } = await supabase.from("luxury_makes").select("make");
  if (error || !data) return false;
  return data.some((row) => row.make.toLowerCase() === make.toLowerCase());
}

export async function getLuxuryLoadFactor() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("luxury_settings").select("load_factor").eq("id", true).maybeSingle();
    if (!error && data) return Number(data.load_factor);
  }
  return LUXURY_LOAD_FACTOR;
}

export async function validateCoupon(code) {
  if (!code) return null;
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("coupons")
      .select("code, type, value, label")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!error && data) return data;
    if (!error) return null; // configured + reachable, just no such coupon — don't fall through
  }
  return validateCouponLocal(code);
}

export async function computeEstimate({
  fromCity,
  toCity,
  vehicleType,
  make,
  selectedAddOns = [],
  couponCode,
  pickupMethod,
  dropoffMethod,
}) {
  const route = await getRoute(fromCity, toCity);
  if (!route) return null;

  const vehicleTypes = await getVehicleTypes();
  // Rupee surcharge derived from the multiplier applied to THIS route's own
  // price, not a flat amount — so it scales with distance. Sedan's 1.0x
  // multiplier resolves to 0 (no line shown), SUV/Luxury show a surcharge,
  // Hatchback's sub-1.0 multiplier shows a discount.
  const vehiclePriceMultiplier = vehicleTypes.find((v) => v.name === vehicleType)?.priceMultiplier ?? 1;
  const rawVehicleSurcharge = Math.round(route.price * (vehiclePriceMultiplier - 1));

  const isLuxury = await isLuxuryMake(make);
  const luxuryLoadFactor = isLuxury ? await getLuxuryLoadFactor() : 1;
  // The luxury multiplier applies to the vehicle/transportation cost only —
  // never to flat-fee add-ons like Insurance — and is folded directly into
  // vehicleSurcharge here (rather than applied separately at the end) so
  // every place that displays "route.price + vehicleSurcharge" as the
  // Transportation total automatically shows the luxury-inclusive figure,
  // and subtotal below is a plain, reconcilable sum instead of hiding an
  // extra multiplication the customer can't see the reason for.
  const vehicleSurcharge = Math.round((route.price + rawVehicleSurcharge) * luxuryLoadFactor) - route.price;

  const addOnCatalog = await getAddOnServices();
  const addOnBreakdown = addOnCatalog.filter((a) => selectedAddOns.includes(a.key));
  const addOnsTotal = addOnBreakdown.reduce((sum, a) => sum + Number(a.price), 0);

  const pickupCharge = pickupMethod === "driver" ? DRIVER_PICKUP_CHARGE : 0;
  const dropoffCharge = dropoffMethod === "driver" ? DRIVER_DROPOFF_CHARGE : 0;

  // Route price, vehicle surcharge, add-ons, and driver pickup/drop-off
  // fees are all stored/priced exclusive of GST — this is the taxable
  // value GST_RATE below applies to.
  const subtotal = route.price + vehicleSurcharge + addOnsTotal + pickupCharge + dropoffCharge;
  const gst = Math.round(subtotal * GST_RATE);

  const coupon = await validateCoupon(couponCode);
  // "flat" coupons are a straight rupee amount off — clamp to the subtotal
  // so a flat coupon bigger than the order (or stacked with other charges)
  // can never push the total negative. "percent" coupons can't exceed the
  // subtotal by construction (value is 0-100), but Math.round + clamp keeps
  // both branches consistent. Discount is off the pre-tax subtotal, not the
  // GST-inclusive total — GST itself isn't discounted.
  const discount = coupon
    ? Math.min(
        coupon.type === "flat" ? Math.round(coupon.value) : Math.round(subtotal * (coupon.value / 100)),
        subtotal
      )
    : 0;
  const total = subtotal + gst - discount;

  return {
    route,
    vehicleType: vehicleType || null,
    minDays: route.minDays ?? 1,
    vehicleSurcharge,
    pickupCharge,
    dropoffCharge,
    addOnsTotal,
    addOnBreakdown,
    selectedAddOns,
    isLuxury,
    luxuryLoadFactor,
    subtotal,
    gst,
    coupon,
    discount,
    total,
  };
}

export function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
