// Shared case study data — the /case-studies listing (CaseStudiesShowcase)
// and each /case-studies/[slug] detail page both read from this single
// source so titles, images, and metadata never drift out of sync.
//
// Client names are anonymized ("a leading luxury car brand", etc.) —
// same convention CaseStudiesShowcase.js already used before this file
// existed, since these are illustrative placeholders, not real clients.

import {
  Car,
  Clock,
  Factory,
  HeartPulse,
  Landmark,
  MapPin,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export const FEATURED_STUDIES = [
  {
    slug: "premium-car-manufacturer-pan-india-distribution",
    industry: "Automotive",
    category: "Automotive Logistics",
    title: "Premium Car Manufacturer: Streamlining Pan-India Distribution",
    description:
      "How we helped one of India's leading luxury car brands reduce their transit damage by 40% and improve last-mile delivery speed across 15 Tier-2 cities using our specialized closed-container fleet.",
    stats: [
      { value: "40%", label: "Damage Reduction", icon: ShieldCheck },
      { value: "12%", label: "Cost Savings", icon: TrendingUp },
      { value: "15+", label: "New Hubs Active", icon: MapPin },
    ],
    image: "/contact-hero-truck.png",
    heroTitle: "Redefining Car Transportation For a Leading Automotive Brand",
    heroHighlight: "Leading Automotive Brand",
    breadcrumbLabel: "Leading Automotive Brand",
    heroSubtitle:
      "How CarCoolie helped a major automotive brand streamline vehicle logistics across India with safety and efficiency.",
    client: "Luxury Automotive Manufacturer",
    challengeHeadline: "Premium Standards. Zero Margin For Error.",
    solutionHeadline: "Closed-Container Fleet. Tracked Every Mile.",
    resultsHeadline: "Damage Down. Coverage Up.",
    challenge:
      "A premium car manufacturer needed to reach 15 new Tier-2 cities without compromising on the finish their brand is known for — and open transport alone wasn't going to protect that reputation over long highway stretches.",
    solution:
      "CarCoolie rolled out a dedicated closed-container fleet for the brand's Tier-2 expansion, paired with condition-report photography at every handover and a single point of contact tracking each shipment end to end.",
    results:
      "Transit damage dropped 40% in the first two quarters, logistics costs fell 12% through better route consolidation, and all 15 new hubs were live and receiving stock on schedule.",
    quote:
      "CarCoolie didn't just move our fleet; they transformed our entire distribution chain with clinical precision and unmatched reliability. This is the new standard for automotive logistics.",
    quoteHighlights: ["clinical precision", "unmatched reliability"],
    quoteAuthor: "Rahul Sharma",
    quoteAttribution: "Director of Global Operations, Vantage Motors",
  },
  {
    slug: "national-dealer-network-zero-delay-transfers",
    industry: "Automotive",
    category: "Fleet Relocation",
    title: "National Dealer Network: Zero-Delay Stock Transfers",
    description:
      "Coordinating multi-city dealer stock transfers for a leading two-wheeler brand, cutting average transfer time by a third while keeping every vehicle fully insured in transit.",
    stats: [
      { value: "33%", label: "Faster Transfers", icon: TrendingUp },
      { value: "0", label: "Transit Losses", icon: ShieldCheck },
      { value: "20+", label: "Dealer Hubs", icon: MapPin },
    ],
    image: "/servicehero.png",
    heroTitle: "Eliminating Delay In Dealer Stock Transfers Nationwide",
    heroHighlight: "Dealer Stock Transfers Nationwide",
    breadcrumbLabel: "National Dealer Network",
    heroSubtitle:
      "How CarCoolie helped a leading two-wheeler brand cut dealer transfer times by a third without a single transit loss.",
    client: "National Two-Wheeler Dealer Network",
    challengeHeadline: "Scattered Bookings. Unpredictable Transfers.",
    solutionHeadline: "One Schedule. Full Visibility.",
    resultsHeadline: "Faster Transfers. Zero Losses.",
    challenge:
      "Stock transfers between 20+ dealer hubs were booked ad hoc, city by city, which meant unpredictable transit times and no single view of where inventory actually was on any given day.",
    solution:
      "We consolidated every hub into one recurring transfer schedule with shared tracking, so dispatch, in-transit, and delivery status were visible across the whole network instead of one booking at a time.",
    results:
      "Average transfer time fell by a third, transit losses dropped to zero across the measured period, and the dealer network now plans stock allocation around a schedule it can actually rely on.",
    quote:
      "We stopped chasing shipments and started planning around them. That shift alone changed how we run inventory.",
    quoteHighlights: ["stopped chasing shipments", "changed how we run inventory"],
    quoteAuthor: "Ananya Verma",
    quoteAttribution: "Operations Head, Dealer Network",
  },
  {
    slug: "corporate-fleet-client-nationwide-relocation",
    industry: "BFSI",
    category: "Enterprise Logistics",
    title: "Corporate Fleet Client: Scaling Nationwide Relocation",
    description:
      "Building a recurring logistics pipeline for a corporate fleet operator, consolidating scattered regional bookings into one predictable, trackable monthly schedule.",
    stats: [
      { value: "45%", label: "Cost Efficiency", icon: TrendingUp },
      { value: "99%", label: "On-Time Rate", icon: Clock },
      { value: "10+", label: "States Covered", icon: MapPin },
    ],
    image: "/contact-hero-truck.png",
    heroTitle: "Scaling Nationwide Relocation For a Corporate Fleet Client",
    heroHighlight: "Corporate Fleet Client",
    breadcrumbLabel: "Corporate Fleet Client",
    heroSubtitle:
      "How CarCoolie consolidated scattered regional bookings into one predictable, trackable monthly schedule.",
    client: "Corporate Fleet Operator",
    challengeHeadline: "Fragmented Vendors. No Consolidated View.",
    solutionHeadline: "One Contract. One Monthly Schedule.",
    resultsHeadline: "Lower Costs. Reliable Delivery.",
    challenge:
      "Each regional office was booking vehicle relocations independently, through different vendors and on different terms — no consolidated visibility, and no consistent pricing across the fleet.",
    solution:
      "CarCoolie replaced the patchwork of regional bookings with a single nationwide contract and one monthly schedule, giving the client one dashboard for every relocation across 10+ states.",
    results:
      "Cost efficiency improved by 45% through route consolidation and volume pricing, with a 99% on-time rate that finally gave regional teams a schedule worth planning around.",
    quote:
      "One contract, one schedule, one number to call — that's what we needed, and that's what we got.",
    quoteHighlights: ["One contract, one schedule, one number to call"],
    quoteAuthor: "Devika Rao",
    quoteAttribution: "Fleet Manager, Corporate Fleet Operator",
  },
];

// One entry per filter industry, so every pill has something to show in
// "More Case Studies". Same dummy-placeholder convention as FEATURED_STUDIES.
export const MORE_CASE_STUDIES = [
  {
    slug: "leading-nbfc-company-field-fleet-logistics",
    industry: "BFSI",
    category: "BFSI",
    title: "Leading NBFC Company",
    description: "Secure vehicle logistics for field teams across 500+ locations.",
    icon: Landmark,
    image: "/servicehero.png",
    stats: [
      { value: "500+", label: "Locations Served", icon: MapPin },
      { value: "0", label: "Security Incidents", icon: ShieldCheck },
    ],
    heroTitle: "Securing Field Fleet Logistics For a Leading NBFC",
    heroHighlight: "Leading NBFC",
    breadcrumbLabel: "Leading NBFC Company",
    heroSubtitle: "How CarCoolie delivered secure vehicle logistics for field teams across 500+ locations.",
    client: "Non-Banking Financial Company",
    challengeHeadline: "500+ Locations. Unverified Vendors.",
    solutionHeadline: "Vetted Carriers. Tracked Custody.",
    resultsHeadline: "Full Coverage. Zero Incidents.",
    challenge:
      "Field agent vehicles needed to reach 500+ branch locations, many in areas where the client had no existing logistics vendor they could vouch for on security.",
    solution:
      "CarCoolie built a vetted, tracked carrier chain for every leg of the relocation, with chain-of-custody handoffs recorded at each stop between the depot and the final branch.",
    results:
      "Every one of the 500+ locations was reached with zero security incidents, giving the client a logistics partner it could extend into new branches without re-vetting each route.",
    quote: "Security wasn't a line item they upsold us on — it was just how they operated.",
    quoteHighlights: ["just how they operated"],
    quoteAuthor: "Aditya Malhotra",
    quoteAttribution: "Admin Head, NBFC",
  },
  {
    slug: "auto-dealer-network-nationwide-relocation",
    industry: "Automotive",
    category: "Automotive",
    title: "Auto Dealer Network",
    description: "Nationwide vehicle relocation for a growing dealership network.",
    icon: Car,
    image: "/contact-hero-truck.png",
    stats: [
      { value: "28%", label: "Faster Onboarding", icon: TrendingUp },
      { value: "12+", label: "New Dealerships", icon: MapPin },
    ],
    heroTitle: "Powering Nationwide Relocation For a Growing Dealer Network",
    heroHighlight: "Growing Dealer Network",
    breadcrumbLabel: "Auto Dealer Network",
    heroSubtitle:
      "How CarCoolie supported a growing dealership network with reliable nationwide vehicle relocation.",
    client: "Expanding Auto Dealership Network",
    challengeHeadline: "Every Launch. A Logistics Scramble.",
    solutionHeadline: "One Playbook. Repeatable Onboarding.",
    resultsHeadline: "Faster Launches. Proven Process.",
    challenge:
      "Every new dealership the client opened meant standing up vehicle logistics from scratch, which slowed how quickly a new location could actually start selling.",
    solution:
      "We built a repeatable relocation playbook the client could apply to each new dealership, cutting the logistics setup from a bespoke project to a standard onboarding step.",
    results:
      "New dealership onboarding sped up by 28%, and 12+ new locations have launched on the same playbook without re-negotiating logistics each time.",
    quote: "Opening a new dealership used to mean a logistics scramble. Now it's just a checklist item.",
    quoteHighlights: ["logistics scramble", "just a checklist item"],
    quoteAuthor: "Priya Nair",
    quoteAttribution: "Expansion Lead, Dealer Network",
  },
  {
    slug: "healthcare-group-critical-vehicle-logistics",
    industry: "Healthcare",
    category: "Healthcare",
    title: "Healthcare Group",
    description: "Transporting emergency and support vehicles across multiple states.",
    icon: HeartPulse,
    image: "/core.jpg",
    stats: [
      { value: "99.5%", label: "On-Time Rate", icon: Clock },
      { value: "8", label: "States Covered", icon: MapPin },
    ],
    heroTitle: "Keeping Critical Vehicles Moving For a Healthcare Group",
    heroHighlight: "Healthcare Group",
    breadcrumbLabel: "Healthcare Group",
    heroSubtitle:
      "How CarCoolie transported emergency and support vehicles across multiple states without disruption.",
    client: "Multi-State Healthcare Group",
    challengeHeadline: "Critical Vehicles. No Room For Delay.",
    solutionHeadline: "Priority Scheduling. Standby Carriers.",
    resultsHeadline: "Reliable Timing. Uninterrupted Care.",
    challenge:
      "Support and emergency-response vehicles needed to move between facilities across 8 states without downtime — a delay in relocation meant a vehicle unavailable for patient care somewhere else.",
    solution:
      "CarCoolie scheduled every relocation around the client's operational calendar, prioritizing critical-vehicle moves and keeping a standby carrier on call for urgent transfers.",
    results:
      "A 99.5% on-time rate across all 8 states meant vehicles were reliably where they needed to be, without the group having to build in slack for logistics delays.",
    quote: "When a vehicle move affects patient care, on-time isn't a nice-to-have. CarCoolie treated it that way from day one.",
    quoteHighlights: ["on-time isn't a nice-to-have"],
    quoteAuthor: "Karan Mehta",
    quoteAttribution: "Facilities Director, Healthcare Group",
  },
  {
    slug: "retail-chain-store-expansion-logistics",
    industry: "Retail",
    category: "Retail",
    title: "Retail Chain",
    description: "Multi-city vehicle movement for store expansions and supply chain.",
    icon: ShoppingCart,
    image: "/servicehero.png",
    stats: [
      { value: "22%", label: "Faster Store Launches", icon: TrendingUp },
      { value: "18+", label: "Cities Covered", icon: MapPin },
    ],
    heroTitle: "Supporting Store Expansion For a Nationwide Retail Chain",
    heroHighlight: "Nationwide Retail Chain",
    breadcrumbLabel: "Retail Chain",
    heroSubtitle:
      "How CarCoolie moved vehicles across cities to keep pace with a fast-growing retail chain's expansion.",
    client: "Nationwide Retail Chain",
    challengeHeadline: "Tight Timelines. Staggered Launches.",
    solutionHeadline: "Scheduling Matched To Store Openings.",
    resultsHeadline: "Faster Launches, On-Time In Every City.",
    challenge:
      "A fast-paced store expansion plan meant supply and support vehicles needed to reach 18+ new cities on tight, staggered launch timelines set months apart from each other.",
    solution:
      "We matched carrier scheduling to the client's store-launch calendar city by city, so vehicle relocation was never the reason a new store opening slipped.",
    results:
      "Store launches moved 22% faster on average, with vehicle relocation for all 18+ cities landing inside the client's own launch windows.",
    quote: "Every other vendor made us plan around them. CarCoolie planned around us.",
    quoteHighlights: ["CarCoolie planned around us"],
    quoteAuthor: "Neha Kapoor",
    quoteAttribution: "Expansion Manager, Retail Chain",
  },
  {
    slug: "online-marketplace-last-mile-fleet-relocation",
    industry: "E-commerce",
    category: "E-commerce",
    title: "Online Marketplace",
    description: "Last-mile delivery fleet relocation across metro hubs.",
    icon: PackageSearch,
    image: "/contact-hero-truck.png",
    stats: [
      { value: "30%", label: "Faster Hub Ramp-Up", icon: TrendingUp },
      { value: "6", label: "Metro Hubs", icon: MapPin },
    ],
    heroTitle: "Relocating Last-Mile Fleets For a Leading Online Marketplace",
    heroHighlight: "Leading Online Marketplace",
    breadcrumbLabel: "Online Marketplace",
    heroSubtitle:
      "How CarCoolie relocated last-mile delivery fleets across metro hubs for a leading e-commerce marketplace.",
    client: "E-commerce Marketplace",
    challengeHeadline: "New Hubs. Short Lead Times.",
    solutionHeadline: "Fleet Pre-Staged Before Go-Live.",
    resultsHeadline: "Faster Ramp-Up. On-Schedule Launches.",
    challenge:
      "Ramping up a new metro delivery hub meant relocating a full last-mile fleet on a short lead time, with the hub unable to start operating until the vehicles arrived.",
    solution:
      "CarCoolie pre-staged fleet relocations ahead of each hub's go-live date, syncing delivery of the vehicles with the client's own facility readiness timeline.",
    results:
      "Hub ramp-up time improved by 30% across the metros covered, with fleet vehicles consistently arriving in time to hit the client's launch date instead of pushing it back.",
    quote: "The trucks showed up before we were even done setting up the hub. That's the kind of lead time we needed.",
    quoteHighlights: ["before we were even done setting up the hub"],
    quoteAuthor: "Vikram Iyer",
    quoteAttribution: "Hub Operations Lead, Online Marketplace",
  },
  {
    slug: "auto-parts-manufacturer-just-in-time-transfers",
    industry: "Manufacturing",
    category: "Manufacturing",
    title: "Auto Parts Manufacturer",
    description: "Just-in-time component and vehicle transfers between plants.",
    icon: Factory,
    image: "/core.jpg",
    stats: [
      { value: "97%", label: "JIT Accuracy", icon: ShieldCheck },
      { value: "5", label: "Plants Connected", icon: MapPin },
    ],
    heroTitle: "Enabling Just-In-Time Transfers For an Auto Parts Manufacturer",
    heroHighlight: "Auto Parts Manufacturer",
    breadcrumbLabel: "Auto Parts Manufacturer",
    heroSubtitle:
      "How CarCoolie ran just-in-time component and vehicle transfers between manufacturing plants.",
    client: "Auto Parts Manufacturer",
    challengeHeadline: "Five Plants. Zero Room For Delay.",
    solutionHeadline: "Fixed Routes. Daily Transfer Windows.",
    resultsHeadline: "High Accuracy. Predictable Production.",
    challenge:
      "Five manufacturing plants depended on tightly-timed vehicle transfers between sites — a late arrival at any one plant risked stalling the production line downstream.",
    solution:
      "We built dedicated transfer routes between all 5 plants with fixed daily windows, so production planning could treat inter-plant transfers as a fixed input, not a variable.",
    results:
      "Just-in-time transfer accuracy reached 97% across all 5 plants, removing inter-plant logistics as a recurring risk in the client's production schedule.",
    quote: "We stopped building buffer time into our production schedule for logistics. We haven't needed it since.",
    quoteHighlights: ["stopped building buffer time", "haven't needed it since"],
    quoteAuthor: "Sanjay Kulkarni",
    quoteAttribution: "Plant Operations Manager, Auto Parts Manufacturer",
  },
];

export const ALL_CASE_STUDIES = [...FEATURED_STUDIES, ...MORE_CASE_STUDIES];

export function getCaseStudyBySlug(slug) {
  return ALL_CASE_STUDIES.find((study) => study.slug === slug);
}
