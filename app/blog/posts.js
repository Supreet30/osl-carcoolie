// Shared blog post data — the /blog listing (BlogShowcase) and each
// /blog/[slug] detail page both read from this single source so titles,
// images, and metadata never drift out of sync between the two.

export const BLOG_POSTS = [
  {
    slug: "top-5-benefits-of-professional-car-transport",
    category: "Industry Insights",
    tag: "Industry",
    pill: "Industry Insights",
    title: "Top 5 Benefits of Using Professional Car Transport Services",
    highlight: "Professional Car Transport Services",
    excerpt:
      "From door-to-door pickup to fully insured transit, here's what you actually gain by handing your car over to a dedicated carrier instead of driving it yourself.",
    image: "/servicehero.png",
    author: "Kuldeep Singh",
    date: "May 20, 2025",
    readTime: "5 Min Read",
    pullQuote:
      "The real cost of a DIY drive isn't the fuel — it's the risk you're taking on for a car that's supposed to arrive exactly as it left.",
    sections: [
      {
        heading: "You save the wear, the fuel, and the risk",
        paragraphs: [
          "Every self-driven long-distance move puts extra kilometres, fuel cost, and road risk on a vehicle that's supposed to arrive in showroom condition — not with a fresh set of highway miles on the odometer.",
          "A professional carrier moves your car on a truck bed instead, so the only wear it takes is the trip itself, not the journey to get there.",
        ],
      },
      {
        heading: "Insurance and tracking come as standard",
        paragraphs: [
          "Reputable transporters carry in-transit insurance and give you a tracking ID, so you always know where the vehicle is and who's liable if something goes wrong — protection you don't get driving it yourself.",
          "Combined with trained drivers and secured loading, that's the difference between hoping for the best and knowing exactly what's covered.",
        ],
      },
    ],
  },
  {
    slug: "how-to-prepare-your-car-for-long-distance-transport",
    category: "Car Care",
    tag: "Guides",
    pill: "Transport Guide",
    title: "Everything You Need to Know Before Shipping Your Car",
    highlight: "Before Shipping Your Car",
    excerpt:
      "A first-time car shipment comes with a lot of questions. Here's a practical rundown of what to prepare, what to expect, and what actually happens on delivery day.",
    image: "/contact-hero-truck.png",
    author: "Rahul Bansal",
    date: "May 18, 2025",
    readTime: "6 Min Read",
    pullQuote:
      "Two minutes of photos before pickup is the cheapest insurance you'll ever take out on a car shipment.",
    sections: [
      {
        heading: "Before pickup: what to do with the car",
        paragraphs: [
          "Give the car a quick wash so any existing scratches or dents are easy to spot, remove personal belongings and toll tags, and leave roughly a quarter tank of fuel — enough to load and unload, not so much it adds unnecessary weight.",
          "Note down the odometer reading and take a few timestamped photos from each side. It's a two-minute step that makes the pre-transit condition report at pickup completely unambiguous.",
        ],
      },
      {
        heading: "What happens on delivery day",
        paragraphs: [
          "The driver will call ahead to confirm the drop-off window, walk the vehicle around with you to match it against the pickup condition report, and hand over the paperwork once you've signed off.",
          "If anything looks different from pickup, flag it on the spot — it's far easier to resolve at handover than after the truck has left.",
        ],
      },
    ],
  },
  {
    slug: "carcoolie-expands-to-28-states",
    category: "Company Update",
    tag: "Company",
    pill: "Company News",
    title: "CarCoolie Expands Services to 28+ States Across India",
    highlight: "28+ States Across India",
    excerpt:
      "Our carrier network now reaches every corner of the country. Here's what the expansion means for delivery times and coverage.",
    image: "/core.jpg",
    author: "Rohit Sharma",
    date: "May 15, 2025",
    readTime: "4 Min Read",
    pullQuote:
      "Coverage isn't just about more routes — it's about never having to say a destination is out of reach.",
    sections: [
      {
        heading: "A carrier network that now spans the country",
        paragraphs: [
          "What started as a handful of metro-to-metro routes has grown into a network covering 28+ states and 650+ service locations, from major highway corridors down to smaller city hubs that used to be out of reach.",
          "That growth was driven by demand from dealerships and manufacturers who needed reliable coverage well beyond the usual metro lanes.",
        ],
      },
      {
        heading: "What it means for you",
        paragraphs: [
          "More coverage translates directly into shorter routing detours, tighter delivery windows, and more pickup slots to choose from — even for tier-2 and tier-3 destinations.",
          "It's the same tracking, insurance, and handling standards you'd get on a metro route, just available in far more places.",
        ],
      },
    ],
  },
  {
    slug: "common-myths-about-car-transport-busted",
    category: "Tips & Advice",
    tag: "Guides",
    pill: "Pro Tips",
    title: "Common Myths About Car Transport – Busted!",
    highlight: "Busted!",
    excerpt:
      "\"It's too expensive\", \"my car will get damaged\", \"open carriers aren't safe\" — we put the most common car transport myths to the test.",
    image: "/servicehero.png",
    author: "Shaily Rana",
    date: "May 12, 2025",
    readTime: "5 Min Read",
    pullQuote:
      "Every myth about car transport falls apart the moment you compare it to the real cost of doing it yourself.",
    sections: [
      {
        heading: "Myth: it's always more expensive than driving it yourself",
        paragraphs: [
          "Once you factor in fuel, tolls, meals, lodging, and the extra wear on the vehicle over a multi-day drive, professional transport is very often the cheaper option — not the pricier one.",
          "It's also the only option where the cost is fixed upfront, with no surprise expenses partway through the trip.",
        ],
      },
      {
        heading: "Myth: open carriers aren't safe enough",
        paragraphs: [
          "Open carriers are how the vast majority of new cars reach dealerships worldwide — they're secured with wheel straps at multiple points and built for exactly this job.",
          "Enclosed carriers exist for extra weather and dust protection on top of that, not because open transport is inherently unsafe.",
        ],
      },
    ],
  },
  {
    slug: "open-vs-enclosed-transport",
    category: "Industry Insights",
    tag: "Industry",
    pill: "Industry Insights",
    title: "Open vs Enclosed Transport: Which One Should You Choose?",
    highlight: "Which One Should You Choose?",
    excerpt:
      "Both get your car there safely — the right choice comes down to budget, vehicle value, and how much weather protection you actually need.",
    image: "/contact-hero-truck.png",
    author: "Shruti Singh",
    date: "May 10, 2025",
    readTime: "6 Min Read",
    pullQuote:
      "The right carrier isn't the fancier one — it's the one that matches what your car actually needs.",
    sections: [
      {
        heading: "Open carriers: the default for a reason",
        paragraphs: [
          "Open transport is faster to book, more widely available, and noticeably cheaper — it's the right call for daily drivers, dealer stock transfers, and most household car moves.",
          "The vehicle is fully secured and insured in transit; it's simply exposed to the weather, the same way it would be on any open road.",
        ],
      },
      {
        heading: "Enclosed carriers: for when the car needs it",
        paragraphs: [
          "Enclosed transport shields the vehicle from dust, road debris, and weather entirely — the standard choice for luxury, vintage, and high-value performance cars.",
          "It costs more and takes a little longer to schedule, but for a vehicle where even a hairline paint chip matters, that trade-off is usually worth it.",
        ],
      },
    ],
  },
  {
    slug: "5-signs-you-need-a-professional-car-carrier",
    category: "Car Care",
    tag: "Guides",
    pill: "Transport Guide",
    title: "5 Signs You Need a Professional Car Carrier",
    highlight: "Professional Car Carrier",
    excerpt:
      "Relocating, buying from another city, or moving a fleet — here's how to know when it's time to stop considering a self-drive and book a carrier instead.",
    image: "/core.jpg",
    author: "Kuldeep Singh",
    date: "May 8, 2025",
    readTime: "4 Min Read",
    pullQuote:
      "If you're already doing the math on fuel, tolls, and two days off work, you've already answered the question.",
    sections: [
      {
        heading: "The trip is longer than a day's drive",
        paragraphs: [
          "Anything beyond a comfortable single-day drive starts eating into fuel, lodging, and fatigue-driven risk — a carrier covers the same distance without putting you or the car through it.",
          "It's an especially easy call when the move is interstate and you'd otherwise be driving through unfamiliar roads overnight.",
        ],
      },
      {
        heading: "You're moving more than one vehicle",
        paragraphs: [
          "Relocating a household with two or three cars, or shifting dealer stock, quickly turns into a logistics problem no single driver can solve alone — a carrier moves the whole fleet in one coordinated trip.",
          "It also means every vehicle arrives on the same schedule, instead of staggered over several separate drives.",
        ],
      },
    ],
  },
  {
    slug: "carcoolie-crosses-75000-vehicles-delivered",
    category: "Company Update",
    tag: "Company",
    pill: "Company News",
    title: "CarCoolie Crosses 75,000 Vehicles Delivered",
    highlight: "75,000 Vehicles Delivered",
    excerpt:
      "A milestone built one careful delivery at a time — a quick look at how we got here and what's next.",
    image: "/servicehero.png",
    author: "Rahul Bansal",
    date: "May 5, 2025",
    readTime: "3 Min Read",
    pullQuote:
      "75,000 deliveries is really just one delivery, repeated 75,000 times, without ever cutting a corner.",
    sections: [
      {
        heading: "75,000 deliveries, one careful handover at a time",
        paragraphs: [
          "From individual owners moving a single car to dealerships relocating entire fleets, that number represents 75,000 separate handovers where the same condition report, tracking, and insurance standard applied every time.",
          "It's a milestone we measure less by the count itself and more by the 98.6% on-time delivery rate that came with it.",
        ],
      },
      {
        heading: "Where we're headed next",
        paragraphs: [
          "The next phase is about depth, not just reach — more service locations within the states we already cover, and faster average transit times on the routes our customers use most.",
          "Thank you to every customer, dealer, and manufacturer partner who trusted us with vehicle number one — and vehicle number 75,000.",
        ],
      },
    ],
  },
  {
    slug: "understanding-vehicle-insurance-during-transit",
    category: "Tips & Advice",
    tag: "Guides",
    pill: "Pro Tips",
    title: "Understanding Vehicle Insurance During Transit",
    highlight: "During Transit",
    excerpt:
      "What's actually covered while your car is on the truck, what isn't, and the questions worth asking before you book.",
    image: "/contact-hero-truck.png",
    author: "Rohit Sharma",
    date: "May 2, 2025",
    readTime: "5 Min Read",
    pullQuote:
      "Ask for the insurance certificate before you ask for the price — it tells you more about the carrier.",
    sections: [
      {
        heading: "What in-transit cover typically includes",
        paragraphs: [
          "A proper carrier policy covers loading and unloading damage, transit collisions, and theft while the vehicle is in the carrier's custody — the same window where your own personal car insurance usually doesn't apply.",
          "Ask for the policy value and certificate before pickup, not after — it should be handed over as routinely as the booking confirmation itself.",
        ],
      },
      {
        heading: "What to double-check before you book",
        paragraphs: [
          "Confirm whether the cover is per-vehicle or a shared fleet limit, what the claim process looks like, and how quickly damage needs to be reported after delivery.",
          "A transporter that answers these clearly before you've even asked twice is usually the one that will make claims just as straightforward if you ever need one.",
        ],
      },
    ],
  },
];

// Author bylines — keyed by name so every post by the same person (see
// each entry's `author` field above) shares one photo/role/bio, matching
// the roster already established on the Team page.
export const AUTHORS = {
  "Kuldeep Singh": {
    role: "Assistant Manager",
    image: "/team/1.jpg",
    bio: "Handles day-to-day carrier coordination and customer support at CarCoolie, with a close eye on what actually goes wrong — and right — during a shipment.",
  },
  "Shruti Singh": {
    role: "Logistics Head",
    image: "/team/2.jpg",
    bio: "Leads route planning and carrier network operations, with years of experience moving vehicles safely across India's highways.",
  },
  "Rahul Bansal": {
    role: "Founder & CEO",
    image: "/team/3.jpg",
    bio: "Founded CarCoolie to bring dealership-grade car transport standards to everyday vehicle owners across the country.",
  },
  "Shaily Rana": {
    role: "Senior Manager",
    image: "/team/4.jpg",
    bio: "Oversees quality and claims at CarCoolie, turning real customer feedback into clearer processes and fewer surprises.",
  },
  "Rohit Sharma": {
    role: "Head Of Operations",
    image: "/team/5.jpg",
    bio: "Runs day-to-day operations across CarCoolie's carrier network, focused on keeping every delivery on schedule.",
  },
};

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

// Deterministic id for a section heading — shared by the article body
// (as the scroll target) and the Table of Contents sidebar (as the link),
// so the two never fall out of sync.
export function headingId(heading) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
