// Elaborated content for each service's dedicated detail page
// (app/services/[slug]/page.js) — layered on top of the summary fields
// already defined per-service in serviceTabs.js (title, image, description,
// tagline, details, highlights), keyed by the same `slug`, so the listing
// (ServicesShowcase/ExploreServices) and the detail pages never drift out
// of sync. "Learn More" on each ServicesShowcase card links to
// /services/<slug>.
//
// whoItsFor / faqs are written against real Indian commercial vehicle
// transport practice (National Permit under the Motor Vehicles Act 1988,
// AIS-140 GPS tracking mandated by MoRTH, IRDAI-regulated transit
// insurance, GST invoicing / e-way bills under CGST rules) — see
// ComplianceStandards.js for the shared standards block these reference.
import { TABS } from "./serviceTabs";

const EXTRA_CONTENT = {
  "door-to-door-mobility": {
    overview:
      "Every Door To Door move starts with a quick pickup slot near your home or office, so you're never left waiting around a depot. Once your vehicle is loaded under our trained handling team's supervision, it travels on a GPS monitored carrier with real time status updates, and a dedicated coordinator keeps you posted at every milestone until it's signed over at the final address.",
    whoItsFor: [
      "Individuals relocating to a new city who need their car moved to the new address",
      "Families buying a vehicle in one city for use in another",
      "NRIs and professionals who can't personally drive the vehicle long distance",
      "Anyone who wants pickup and delivery handled without a yard visit",
    ],
    faqs: [
      {
        question: "Do I need to bring my car to a yard?",
        answer:
          "No. Our team picks up your vehicle from the address you provide and delivers it to your chosen destination, so there's no yard visit required at either end.",
      },
      {
        question: "Is the vehicle insured for the entire journey?",
        answer:
          "Yes. Every Door To Door shipment is covered under transit insurance for the full distance, from pickup to final handover, in line with IRDAI-regulated goods-in-transit norms.",
      },
      {
        question: "What documents do I need to keep ready?",
        answer:
          "Your vehicle's RC and a valid ID proof are typically all that's needed; our team will confirm the exact list at booking.",
      },
      {
        question: "Will I get a GST invoice?",
        answer:
          "Yes, a GST-compliant invoice is issued for every booking, along with an e-way bill where applicable under CGST rules.",
      },
    ],
  },
  "express-delivery": {
    overview:
      "Express bookings are prioritised the moment they're confirmed, moving straight to the front of the dispatch queue with a carrier assigned on the fastest viable route. There are no shared stops slowing things down, just a dedicated run from pickup to delivery with continuous tracking, so you always know exactly when your vehicle will arrive.",
    whoItsFor: [
      "Buyers who need a vehicle urgently for an event, job relocation or deadline",
      "Dealers closing a time sensitive sale that depends on fast delivery",
      "Customers who need a faster alternative to standard transport",
      "Anyone for whom extra days of transit aren't an option",
    ],
    faqs: [
      {
        question: "How much faster is express compared to standard transport?",
        answer:
          "Express bookings are placed at the front of the dispatch queue and routed directly, typically cutting transit time compared to shared-route standard transport, with an exact estimate shared once your route is confirmed.",
      },
      {
        question: "Does express cost more?",
        answer:
          "Yes, express carries a priority surcharge over standard transport to cover dedicated routing and faster dispatch; the exact amount is shown upfront before you confirm.",
      },
      {
        question: "Can I track an express shipment in real time?",
        answer:
          "Yes, every express booking includes live GPS tracking so you can follow progress and get an accurate arrival estimate.",
      },
      {
        question: "Is express available on every route?",
        answer: "Availability depends on carrier capacity on your specific route; our team confirms this at the time of booking.",
      },
    ],
  },
  "multiple-cars": {
    overview:
      "A single dedicated carrier is allocated to your entire batch of vehicles, so every car travels together on the same multi level transporter instead of being split across separate shipments. That means one pickup schedule, one point of contact, and one delivery window for the whole fleet, with faster turnaround than coordinating several vehicles individually.",
    whoItsFor: [
      "Families relocating with more than one vehicle at once",
      "Dealers transferring several vehicles between showrooms",
      "Fleet owners consolidating multiple cars to a single destination",
      "Anyone who wants one coordinated move instead of separate bookings",
    ],
    faqs: [
      {
        question: "Is it cheaper to move multiple cars together?",
        answer:
          "Yes, consolidating vehicles onto a single dedicated carrier is typically more cost effective per vehicle than booking separate shipments, since it shares one trip, one crew and one delivery window.",
      },
      {
        question: "Can the vehicles go to different addresses?",
        answer:
          "We can accommodate multiple drop points on the same route where practical; share your full list of locations at booking and we'll confirm the most efficient plan.",
      },
      {
        question: "Is each vehicle inspected individually?",
        answer:
          "Yes, every vehicle in the batch gets its own condition record at pickup and its own verification at delivery, regardless of how many are travelling together.",
      },
      {
        question: "How many vehicles can one carrier take?",
        answer: "Capacity depends on vehicle size and the carrier assigned to your booking; our team confirms the right carrier once they know your fleet details.",
      },
    ],
  },
  "luxury-car-transport": {
    overview:
      "Every luxury or vintage vehicle travels inside a fully enclosed, climate controlled carrier, completely shielded from weather, dust and road debris, and out of sight from prying eyes for the entire journey. Our handling team is trained specifically on low clearance, delicate trims and high value vehicles, so loading, securing and unloading is done with the extra care these cars deserve.",
    whoItsFor: [
      "Owners of luxury, imported or exotic vehicles",
      "Collectors moving vintage or classic cars",
      "Buyers of high value vehicles who want enclosed, door to door transport",
      "Anyone who wants their car shielded from weather and kept out of sight in transit",
    ],
    faqs: [
      {
        question: "Why use an enclosed carrier instead of standard transport?",
        answer:
          "An enclosed, climate safe carrier shields your vehicle from weather, dust, road debris and public view for the entire journey, which standard open transport doesn't offer — important for high value, delicate or rare vehicles.",
      },
      {
        question: "Do you handle low ground clearance vehicles?",
        answer:
          "Yes, our handling team reviews each vehicle's ground clearance and specifications beforehand and prepares the carrier's loading ramp accordingly to avoid any scraping or damage.",
      },
      {
        question: "Is insurance coverage higher for luxury vehicles?",
        answer: "Transit insurance is arranged in line with your vehicle's declared value; our team confirms the applicable coverage before your booking is finalised.",
      },
      {
        question: "Can I request a specific delivery time for privacy?",
        answer: "Yes, let us know your preferred delivery window and we'll coordinate the schedule as closely as the route allows.",
      },
    ],
  },
  "oem-to-dealer-pan-india": {
    overview:
      "We work directly against your production and dispatch calendar, running recurring, scheduled trips from plant gates to dealer showrooms in every state. A dedicated account manager coordinates each wave of dispatch, so new inventory lands on showroom floors on a predictable rhythm instead of in unpredictable bursts.",
    whoItsFor: [
      "Vehicle manufacturers dispatching new stock from plants",
      "Dealer networks that need predictable, recurring deliveries",
      "OEMs expanding into new states or Tier-2/Tier-3 markets",
      "Businesses that need a single partner managing nationwide dispatch",
    ],
    faqs: [
      {
        question: "Can you handle recurring, scheduled dispatch volumes?",
        answer: "Yes, we run structured, recurring dispatch cycles aligned to your production calendar, with a dedicated account manager coordinating capacity for each wave.",
      },
      {
        question: "Are your carriers compliant with National Permit regulations?",
        answer:
          "Yes, our fleet operates under valid National Permits issued under the Motor Vehicles Act, 1988, allowing legal, unrestricted interstate movement across India.",
      },
      {
        question: "Is GPS tracking available for fleet-wide dispatch?",
        answer: "Yes, our carriers run on AIS-140 compliant GPS tracking as mandated by the Ministry of Road Transport and Highways, so every dispatch is visible in real time.",
      },
      {
        question: "How are deliveries documented for dealer records?",
        answer: "Every delivery comes with a signed handover document, GST-compliant invoice and e-way bill, giving your dealer network a clean paper trail for each vehicle received.",
      },
    ],
  },
  "used-pre-owned-cars": {
    overview:
      "Every used or pre-owned vehicle is documented at pickup, with its existing condition recorded before it ever leaves the lot, so there's a clear record on both ends of the transfer. GPS tracking and full insurance coverage run through the entire trip, whether the vehicle is headed to a dealer, an auction floor or straight to its next owner.",
    whoItsFor: [
      "Used car dealers moving stock between locations",
      "Auction houses transferring vehicles to buyers",
      "Individuals buying or selling a pre-owned car in another city",
      "Resellers who need condition documentation on both ends of a transfer",
    ],
    faqs: [
      {
        question: "How is the vehicle's existing condition recorded?",
        answer: "We document the vehicle's condition, including existing wear, dents or scratches, at pickup, so there's a clear reference point that protects both the sender and the receiver.",
      },
      {
        question: "Is a used vehicle covered the same way as a new one?",
        answer: "Yes, every vehicle we transport, new or pre-owned, is covered under transit insurance for the full journey.",
      },
      {
        question: "What if the vehicle isn't in running condition?",
        answer: "Let us know at booking; non-running vehicles can usually still be transported with additional handling, subject to confirmation from our team.",
      },
      {
        question: "Can delivery be made directly to the next buyer?",
        answer: "Yes, we can deliver to a dealer, an auction yard, or directly to the next owner, as specified at booking.",
      },
    ],
  },
  "vehicle-stockyard-solutions": {
    overview:
      "Our stockyards are monitored around the clock, with every vehicle logged in on arrival and tracked for as long as it sits with us, whether that's a few hours between transfers or an extended hold ahead of dispatch. The same safety and condition standards that apply during transit carry straight through to storage, so nothing changes the moment a vehicle comes to rest.",
    whoItsFor: [
      "Dealers needing temporary storage between transfers",
      "OEMs holding inventory ahead of scheduled dispatch",
      "Businesses that need vehicles staged before delivery windows open",
      "Anyone needing secure, monitored short or long term vehicle storage",
    ],
    faqs: [
      {
        question: "How secure are your stockyards?",
        answer: "Our stockyards are monitored around the clock with the same safety standards that apply to vehicles in transit, and every vehicle is logged in and tracked for the duration of its stay.",
      },
      {
        question: "Is there a minimum or maximum storage duration?",
        answer: "We accommodate both short holds between transfers and extended storage ahead of dispatch; let us know your expected timeline so we can plan space accordingly.",
      },
      {
        question: "Will my vehicle's condition be checked while in storage?",
        answer: "Yes, stored vehicles go through routine condition checks so you're alerted immediately if anything needs attention.",
      },
      {
        question: "How quickly can a vehicle be dispatched from storage?",
        answer: "Vehicles are pulled from our stockyard inventory and dispatched as soon as you confirm, subject to carrier availability on your route.",
      },
    ],
  },
  "automotive-parts-warehousing": {
    overview:
      "Parts are received, catalogued and shelved by SKU as soon as they arrive, so every item in your inventory has a known location and quantity at all times. When a service centre or dealership places an order, our team picks, packs and dispatches straight from that organised stock, keeping fulfilment fast and your records accurate.",
    whoItsFor: [
      "OEMs needing dedicated storage for spare parts inventory",
      "Dealers who want dispatch-ready stock without managing their own warehouse",
      "Service centres that need reliable, fast turnaround parts fulfilment",
      "Businesses scaling parts distribution without new facility investment",
    ],
    faqs: [
      {
        question: "How is inventory tracked inside the warehouse?",
        answer: "Every part is received, checked and catalogued by SKU on arrival, so your stock has an accurate, up to date record at all times.",
      },
      {
        question: "How fast can an order be fulfilled?",
        answer: "Orders are picked, packed and dispatched directly from organised stock, so turnaround depends mainly on your preferred dispatch schedule rather than warehouse processing time.",
      },
      {
        question: "Can you handle both OEM and dealer-level orders?",
        answer: "Yes, we manage dedicated warehousing for both OEM distribution and dealer or service centre level fulfilment.",
      },
      {
        question: "Do shipments come with proper documentation?",
        answer: "Yes, every dispatch includes a GST-compliant invoice and the required e-way bill for the shipment value, in line with standard logistics documentation practice.",
      },
    ],
  },
};

export const ALL_SERVICE_DETAILS = TABS.flatMap((tab) =>
  tab.services.map((service) => ({
    ...service,
    ...EXTRA_CONTENT[service.slug],
    tabId: tab.id,
    tabLabel: tab.label,
  }))
);

export function getServiceDetailBySlug(slug) {
  return ALL_SERVICE_DETAILS.find((service) => service.slug === slug) ?? null;
}
