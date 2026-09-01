// Pricing engine for the /services/b2c flow. Reference data (cities,
// routes, add-ons, coupons) is fetched from Supabase when it's configured
// (see lib/supabaseClient.js) and supabase-schema.sql has been applied —
// every fetcher below falls back to the same hardcoded dummy data this
// started as if Supabase isn't reachable, so the demo never breaks.

import { isSupabaseConfigured, supabase } from "../../../../lib/supabaseClient";

export const CITIES = ["Delhi", "Chandigarh", "Mumbai", "Bangalore"];

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

export const SERVICE_CHARGE = 1000;
export const GST_RATE = 0.18;

// Vehicle type changes the price — a flat rupee surcharge (or discount,
// for smaller cars) added on top of the route's base transportation price.
export const VEHICLE_TYPES = [
  { name: "Hatchback", priceAddon: -1000 },
  { name: "Sedan", priceAddon: 0 },
  { name: "SUV", priceAddon: 2500 },
  { name: "Luxury Sedan", priceAddon: 6000 },
  { name: "Luxury SUV", priceAddon: 9000 },
  { name: "Sports", priceAddon: 12000 },
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

export async function getCities() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("cities").select("name").eq("is_active", true).order("name");
    if (!error && data?.length) return data.map((c) => c.name);
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
    if (!error && data?.length) return data;
  }
  return ADD_ON_SERVICES;
}

export async function getVehicleTypes() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("vehicle_types")
      .select("name, price_addon")
      .eq("is_active", true)
      .order("price_addon");
    if (!error && data?.length) return data.map((v) => ({ name: v.name, priceAddon: Number(v.price_addon) }));
  }
  return VEHICLE_TYPES;
}

export async function getRoute(fromCity, toCity) {
  if (!fromCity || !toCity || fromCity === toCity) return null;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("routes")
      .select("distance_km, base_price, min_days, from_city:from_city_id(name), to_city:to_city_id(name)")
      .eq("is_active", true);
    if (!error && data?.length) {
      const match = data.find((r) => r.from_city?.name === fromCity && r.to_city?.name === toCity);
      if (match) {
        return {
          fromCity,
          toCity,
          distanceKm: match.distance_km,
          price: Math.round(match.base_price),
          minDays: match.min_days ?? 1,
        };
      }
    }
  }
  return getLocalRoute(fromCity, toCity);
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

export async function computeEstimate({ fromCity, toCity, vehicleType, selectedAddOns = [], couponCode }) {
  const route = await getRoute(fromCity, toCity);
  if (!route) return null;

  const vehicleTypes = await getVehicleTypes();
  // Flat rupee amount added on top of the route price — Sedan (0) shows as
  // no line at all, SUV/Luxury show a surcharge, Hatchback shows a discount.
  const vehicleSurcharge = vehicleTypes.find((v) => v.name === vehicleType)?.priceAddon ?? 0;

  const addOnCatalog = await getAddOnServices();
  const addOnBreakdown = addOnCatalog.filter((a) => selectedAddOns.includes(a.key));
  const addOnsTotal = addOnBreakdown.reduce((sum, a) => sum + Number(a.price), 0);

  const base = route.price + vehicleSurcharge + SERVICE_CHARGE + addOnsTotal;
  const gst = Math.round(base * GST_RATE);
  const subtotal = base + gst;

  const coupon = await validateCoupon(couponCode);
  // "flat" coupons are a straight rupee amount off — clamp to the subtotal
  // so a flat coupon bigger than the order (or stacked with other charges)
  // can never push the total negative. "percent" coupons can't exceed the
  // subtotal by construction (value is 0-100), but Math.round + clamp keeps
  // both branches consistent.
  const discount = coupon
    ? Math.min(
        coupon.type === "flat" ? Math.round(coupon.value) : Math.round(subtotal * (coupon.value / 100)),
        subtotal
      )
    : 0;
  const total = subtotal - discount;

  return {
    route,
    vehicleType: vehicleType || null,
    minDays: route.minDays ?? 1,
    vehicleSurcharge,
    addOnsTotal,
    addOnBreakdown,
    selectedAddOns,
    serviceCharge: SERVICE_CHARGE,
    gst,
    subtotal,
    coupon,
    discount,
    total,
  };
}

export function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
