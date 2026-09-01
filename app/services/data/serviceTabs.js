import { Building2, Users } from "lucide-react";

// Shared by ServicesShowcase (the accordion cards) and ExploreServices (the
// content panel below it) — both read whichever service is currently in
// focus via ServiceSelectionContext, so this is the single source of truth
// for copy across both sections. Written in plain, conversational language
// on purpose (no em dashes) rather than terse marketing fragments.
export const TABS = [
  {
    id: "b2c",
    label: "For Business to Customers",
    icon: Users,
    services: [
      {
        title: "Door To Door (Half Truck Load)",
        image: "/contact-hero-truck.png",
        description:
          "Half truck load carriers with pickup and delivery handled right at your doorstep.",
        tagline: ["Door To Door ", "Vehicle Transport"],
        details:
          "From doorstep pickup to final delivery, our fully managed vehicle transport service handles every mile. Trained handlers, GPS monitored carriers and insured transit ensure your car arrives exactly as it left, clean, intact and on time.",
        highlights: [
          "Professional Loading",
          "Wheel Lock Safety",
          "Covered Trucks Available",
          "Daily Tracking Updates",
          "Insurance Support",
        ],
      },
      {
        title: "Multiple Cars (Full Truck Load)",
        image: "/servicehero.png",
        description:
          "Dedicated full truck load carriers for moving multiple vehicles together, with faster delivery nationwide.",
        tagline: ["Dedicated Carrier, ", "Maximum Protection"],
        details:
          "When you're moving several vehicles at once, a dedicated full truck load carrier keeps everything together and on schedule. There are no shared stops or extra transfers along the way, just a direct run from pickup to your destination with faster delivery across India.",
        highlights: [
          "Dedicated Full Truck",
          "Multiple Vehicles Together",
          "No Shared Stops",
          "Faster Pan India Delivery",
          "Insurance Support",
        ],
      },
      {
        title: "Express Delivery",
        image: "/contact-hero-truck.png",
        description:
          "Priority vehicle transport on the fastest available route, for when timing matters most.",
        tagline: ["Priority Transit, ", "Fastest Routes"],
        details:
          "When timing matters more than anything else, our express service puts your vehicle on the fastest available route with dedicated handling from start to finish. It's built for the moves that simply can't wait.",
        highlights: [
          "Priority Scheduling",
          "Fastest Available Route",
          "Dedicated Handling",
          "Time Sensitive Delivery",
          "Insurance Support",
        ],
      },
      {
        title: "Luxury Car Transport",
        image: "/servicehero.png",
        description:
          "Climate safe, fully enclosed carriers built for luxury, exotic and vintage vehicles.",
        tagline: ["Fully Enclosed, ", "Damage Free Transport"],
        details:
          "Luxury, exotic and vintage vehicles deserve more than an open trailer. Our fully enclosed, climate safe carriers keep your car shielded from weather, dust and prying eyes, with private handling all the way from your door to theirs.",
        highlights: [
          "Fully Enclosed Carriers",
          "Climate Safe Transit",
          "Luxury And Exotic Ready",
          "Private Handling",
          "Door To Door Delivery",
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
        title: "New Car Transportation From Warehouses",
        image: "/servicehero.png",
        description:
          "Scheduled dispatch of new vehicles from warehouses to showrooms, moved safely and on time.",
        tagline: ["Scheduled ", "Warehouse Dispatch"],
        details:
          "New vehicles need to reach showrooms on schedule, every time. We run structured, recurring dispatch from manufacturer and dealer warehouses straight to showroom floors nationwide, so your inventory is never the reason a sale gets delayed.",
        highlights: [
          "Scheduled Dispatch",
          "Manufacturer And Dealer Warehouses",
          "On Time Showroom Delivery",
          "Nationwide Coverage",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Used / Pre-Owned Cars",
        image: "/contact-hero-truck.png",
        description:
          "Secure transport for used and pre-owned vehicles between dealers, auctions and buyers.",
        tagline: ["Secure ", "Pre-Owned Transport"],
        details:
          "Used and pre-owned vehicles move between dealers, auctions and buyers all the time, and each one deserves the same care as a brand new car. Every transfer comes with full tracking and insurance, so ownership changes hands without any surprises.",
        highlights: [
          "Dealer, Auction And Buyer Transfers",
          "Secure Handling",
          "Real Time Tracking",
          "Full Insurance Coverage",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Warehouse",
        image: "/servicehero.png",
        description:
          "End to end warehouse management for dealer and manufacturer vehicle stock.",
        tagline: ["End To End ", "Warehouse Management"],
        details:
          "Keeping dealer and manufacturer vehicle stock organized takes more than just space. We manage the entire warehouse operation for you, keeping inventory secure, accounted for and ready to dispatch the moment it's needed.",
        highlights: [
          "Dealer And Manufacturer Stock",
          "Organized Inventory",
          "Secure Storage",
          "Dispatch Ready Handling",
          "Dedicated Account Manager",
        ],
      },
      {
        title: "Stockyard",
        image: "/contact-hero-truck.png",
        description:
          "Secure, monitored stockyard storage for vehicles in transit or awaiting dispatch.",
        tagline: ["Secure ", "Stockyard Storage"],
        details:
          "Vehicles waiting for their next move need somewhere safe to sit. Our monitored stockyards hold vehicles in transit or ahead of dispatch under the same safety and tracking standards that cover every Car Coolie shipment.",
        highlights: [
          "Monitored Stockyard Storage",
          "In Transit And Pre Dispatch",
          "Consistent Safety Standards",
          "Full Tracking",
          "Dedicated Account Manager",
        ],
      },
    ],
  },
];
