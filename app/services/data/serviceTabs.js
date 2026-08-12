import { Building2, Users } from "lucide-react";

// Shared by ServicesShowcase (the accordion cards) and ExploreServices (the
// content panel below it) — both read whichever service is currently in
// focus via ServiceSelectionContext, so this is the single source of truth
// for copy across both sections.
export const TABS = [
  {
    id: "b2c",
    label: "For Business to Customers",
    icon: Users,
    services: [
      {
        title: "Enclosed Car Carrier",
        image: "/contact-hero-truck.png",
        description:
          "Fully covered trailers for luxury, exotic and vintage vehicles — climate-safe, dust-free and completely private.",
        tagline: ["Door To Door ", "Vehicle Transport."],
        details:
          "From doorstep pickup to final delivery, our fully-managed service handles every mile. Trained handlers, GPS-monitored carriers and insured transit make sure your vehicle arrives exactly as it left — clean, intact and on time.",
        highlights: [
          "Professional Loading",
          "Wheel Lock Safety",
          "Covered Trucks Available",
          "Daily Tracking Updates",
          "Insurance Support",
        ],
      },
      {
        title: "Open Car Carrier",
        image: "/servicehero.png",
        description:
          "Cost-effective multi-vehicle transport on open trailers, ideal for standard cars moving city to city.",
        tagline: ["Fast & ", "Affordable Transport."],
        details:
          "Multiple vehicles travel together on our open trailers, keeping costs low without compromising on care. Ideal for standard cars moving between cities on a set schedule.",
        highlights: [
          "Multi-Vehicle Batching",
          "Scheduled Dispatch",
          "Real-Time GPS Tracking",
          "Trained Loading Crew",
          "Basic Insurance Included",
        ],
      },
      {
        title: "Full Truck Car Carrier",
        image: "/contact-hero-truck.png",
        description:
          "Dedicated full-load carriers for single large shipments, moving faster with no shared stops in between.",
        tagline: ["Dedicated ", "Full-Load Transport."],
        details:
          "Book an entire truck for your shipment with no shared stops in between. Faster transit, tighter handling control and priority scheduling for large or time-sensitive moves.",
        highlights: [
          "Single Dedicated Truck",
          "Priority Scheduling",
          "No Shared Stops",
          "Route Flexibility",
          "Insurance Support",
        ],
      },
      {
        title: "Half Truck Car Carrier",
        image: "/servicehero.png",
        description:
          "Right-sized carriers for smaller loads, built for tighter city routes and hill-station deliveries.",
        tagline: ["Right-Sized ", "City Transport."],
        details:
          "Compact carriers built for tighter city routes, narrow lanes and hill-station deliveries — without paying for capacity you don't need.",
        highlights: [
          "Compact Carrier Size",
          "City & Hill Route Ready",
          "Flexible Pickup Slots",
          "Daily Tracking Updates",
          "Insurance Support",
        ],
      },
    ],
  },
  {
    id: "b2b",
    label: "For Business to Business",
    icon: Building2,
    services: [
      {
        title: "Dealer Stock Transfer",
        image: "/servicehero.png",
        description:
          "Scheduled, high-frequency runs moving new inventory from stockyards to dealership showrooms.",
        tagline: ["Scheduled ", "Dealer Deliveries."],
        details:
          "High-frequency runs moving new inventory from stockyards straight to dealership showrooms, kept on a predictable schedule your sales floor can rely on.",
        highlights: [
          "Recurring Route Slots",
          "Showroom-Ready Handling",
          "Digital Delivery Proof",
          "Fleet-Wide Tracking",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Manufacturer Plant Dispatch",
        image: "/contact-hero-truck.png",
        description:
          "Direct plant-to-hub dispatch for OEMs, with volume capacity and documented chain of custody.",
        tagline: ["Direct ", "Plant-To-Hub Dispatch."],
        details:
          "Structured dispatch straight from the manufacturing plant to regional hubs, with documented chain of custody and volume capacity built for OEM output.",
        highlights: [
          "High-Volume Capacity",
          "Documented Chain Of Custody",
          "Plant-To-Hub Routing",
          "Compliance Reporting",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Fleet Relocation",
        image: "/servicehero.png",
        description:
          "Bulk relocation for rental and corporate fleets, coordinated across multiple pickup points.",
        tagline: ["Bulk ", "Fleet Relocation."],
        details:
          "Coordinated relocation for rental and corporate fleets across multiple pickup points, consolidated into one managed logistics plan.",
        highlights: [
          "Multi-Point Pickup",
          "Consolidated Scheduling",
          "Fleet-Wide Tracking",
          "Damage-Free Handling",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Bulk Vehicle Logistics",
        image: "/contact-hero-truck.png",
        description:
          "End-to-end logistics for large-volume vehicle movement, with real-time tracking on every unit.",
        tagline: ["End-To-End ", "Bulk Logistics."],
        details:
          "Full-service logistics for large-volume vehicle movement, with real-time tracking on every unit from pickup to final drop.",
        highlights: [
          "Large-Volume Capacity",
          "Real-Time Unit Tracking",
          "Custom Reporting",
          "Nationwide Coverage",
          "Dedicated Account Manager",
        ],
      },
    ],
  },
];
