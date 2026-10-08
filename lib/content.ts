/**
 * Every word and image on the site. Copy comes from the old WordPress pages
 * (assets-src/wp/pages.json), lightly copyedited: typos, spun words and
 * placeholders fixed; facts, specs and the Chennai/Coimbatore search phrases
 * kept.
 *
 * Inline marks inside any body string:
 *   ==text==        → yellow text-highlighter (TextHighlighter)
 *   [label](#slug) → in-page link (a product/service slug opens its sheet)
 */

export type Img = { src: string; alt: string };
export type Link = { label: string; href: string };

export type Block =
  | { type: "prose"; heading?: string; body: string[]; bullets?: string[]; image?: Img; figure?: boolean }
  | {
      type: "specs";
      heading: string;
      suitable?: string;
      text?: string;
      image?: Img;
      columns?: string[];
      rows: [label: string, ...values: string[]][];
    }
  | { type: "parts"; heading: string; intro?: string; items: { name: string; text?: string; image: Img }[] }
  | { type: "points"; heading: string; intro?: string; items: { title: string; text: string; href?: string }[] }
  | { type: "gallery"; heading?: string; images: Img[] }
  | { type: "certs"; heading: string; intro: string; items: string[]; image?: Img }
  | { type: "person"; name: string; role: string; image: Img }
  | { type: "children"; heading: string; slugs: string[] }
  | { type: "statement"; first: string; second: string; media: Img; href?: string }
  | { type: "enquiry" };

export type Page = {
  slug: string;
  /** Short name — nav, cards, breadcrumbs. */
  label: string;
  /** The page's H1. */
  title: string;
  group: "company" | "products" | "services";
  description: string;
  lede: string;
  /** Card image on index pages and the share preview. */
  image: Img;
  blocks: Block[];
};

const img = (file: string, alt: string): Img => ({ src: `/site/${file}`, alt });

/* ==========================================================================
   Site
   ========================================================================== */

export const site = {
  name: "Universal Fire Safety Equipments",
  short: "Universal Fire",
  url: "https://universalfire101.com",
  title: "Universal Fire Safety Equipments — fire safety company in Coimbatore & Chennai",
  description:
    "BIS-approved fire extinguishers, fire alarm, hydrant and suppression systems, plus AMC, refilling, training and fire licences across Coimbatore, Chennai and Tamil Nadu. Available 24/7.",
  phone: { display: "+91 98430 77907", tel: "+919843077907" },
  phone2: { display: "+91 90470 77906", tel: "+919047077906" },
  whatsapp: "919843077907",
  email: "universalfiresafe@gmail.com",
  facebook: "https://www.facebook.com/universalfire101",
  instagram: "https://www.instagram.com/universalfire101/",
  linkedin: "https://www.linkedin.com/in/yuvaraj-c-v-3118772ab",
  offices: [
    {
      city: "Coimbatore",
      lines: ["No. 112, First Floor, Subramani Building", "189, R G Street", "Coimbatore 641 001"],
      street: "No. 112, First Floor, Subramani Building, 189, R G Street",
      postcode: "641001",
    },
    {
      city: "Chennai",
      lines: ["No. 30, First Floor, Venkatraman Nagar", "Near Korattur Bus Depot, Korattur", "Chennai 600 080"],
      street: "No. 30, First Floor, Venkatraman Nagar, near Korattur Bus Depot, Korattur",
      postcode: "600080",
    },
  ],
  map: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d501312.57431354956!2d76.95689300000001!3d11.000725!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8591c63099e51%3A0x754dad27687d6341!2sUniversal%20Fire%20Safety%20Equipments!5e0!3m2!1sen!2sus!4v1706078094333!5m2!1sen!2sus",
  footerNote:
    "Our team is made up of highly skilled engineers and technicians, each an expert in their own field. Working around the clock, we deliver top-quality products and solutions to every client.",
};

export const wa = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/* ==========================================================================
   Pages
   ========================================================================== */

const hydrantParts = [
  { name: "Hydrant valve", image: img("fire-fighting-single-hydrant-valve-500x500-1.png", "Single-outlet fire hydrant valve") },
  { name: "Hose reel drum", image: img("hose-reel.png", "Red fire hose reel drum") },
  { name: "FRP hose box", image: img("frp-house-box.png", "Red FRP fire hose box") },
  { name: "Fire service inlet", image: img("fire-inlet.png", "Fire service inlet") },
  { name: "Branch pipe", image: img("branch-pipe.png", "Brass fire branch pipe") },
  { name: "RRL hose with M/F coupling", image: img("rrl-hose-with-coupling.png", "Rolled RRL fire hose with couplings") },
  { name: "Fire sprinklers", image: img("fire-sprinkler.png", "Fire sprinkler heads") },
  { name: "Fire monitor", image: img("fire-monitor.png", "Fire water monitor") },
];

export const pages: Page[] = [
  /* --- Company ----------------------------------------------------------- */
  {
    slug: "about-us",
    label: "About",
    title: "About us",
    group: "company",
    description:
      "Universal Fire is a NABH-accredited provider of certified fire safety equipment, systems and consultation in Chennai and Coimbatore.",
    lede: "The leading provider of certified fire safety equipment, systems and consultation in Chennai and Coimbatore.",
    image: img("016A4576-1024x683-1.webp", "Fire extinguishers being manufactured at Universal Fire"),
    blocks: [
      {
        type: "statement",
        first: "Protecting",
        second: "Tamil Nadu",
        media: img("016A4576-1024x683-1.webp", "Fire extinguishers being manufactured at Universal Fire"),
      },
      {
        type: "prose",
        heading: "Our profile",
        body: [
          "Universal Fire is the leading provider of ==certified fire safety equipment==, systems and consultation in Chennai and Coimbatore. Our team brings together dedicated production professionals, specialist quality-control experts, and a sales and service team that follows up after every sale.",
          "Our training team, led by expert trainers, runs firefighting training, fire drills and evacuation drills at your premises.",
          "We keep up with the latest products and technologies, and we can ==refill every type of fire extinguisher available in India==. A highly qualified management team drives our standards and our ability to deliver. We have our own brand, direct sales and direct service.",
        ],
        image: img("016A4576-1024x683-1.webp", "Fire extinguishers on the production floor"),
      },
      {
        type: "person",
        name: "C. V. Yuvaraj",
        role: "Managing Partner",
        image: img("owner.jpg", "C. V. Yuvaraj, Managing Partner"),
      },
      {
        type: "prose",
        heading: "Leading fire safety equipment company in Chennai & Coimbatore",
        body: [
          "Universal Fire Safety Equipments is a premier provider of complete fire safety solutions, and a trusted name for fire extinguisher dealers, refilling, suppliers, sales and service in Chennai.",
          "Our experts protect your property with a deep understanding of fire safety standards and protocols. Our products and services are built to ==meet and exceed industry expectations==, using the latest technology and innovations.",
        ],
      },
      {
        type: "prose",
        heading: "NABH accreditation",
        body: [
          "Universal Fire is a ==NABH-accredited== fire safety company providing professional fire safety services in Chennai and Coimbatore.",
          "We offer certified fire protection solutions, including all types of fire extinguishers (ABC, CO2 and more) and complete fire system installations. We stay current with the latest technology to serve clients across Tamil Nadu.",
        ],
      },
      {
        type: "parts",
        heading: "The safety measures we provide",
        items: [
          { name: "Fire extinguishers", image: img("Fire-Extinguisher-Pic11.webp", "Row of red fire extinguishers") },
          { name: "Fire alarm systems", image: img("fir-alarm-system.webp", "Fire alarm call point and sounder") },
          { name: "Fire hydrant systems", image: img("fire-hydrant-1.webp", "Fire hydrant valve and hose") },
          { name: "Firefighting training", image: img("fire-fighting-training-1.webp", "Firefighting class in progress") },
          { name: "PA systems", image: img("pa-system.webp", "Public address system speakers") },
          { name: "Automatic sprinkler systems", image: img("Automatic-Sprinkler-System1.webp", "Automatic sprinkler discharging") },
          { name: "Auto-glow signs", image: img("auto-glow.webp", "Photoluminescent auto-glow exit sign") },
        ],
      },
    ],
  },
  {
    slug: "contact-us",
    label: "Contact",
    title: "Contact us",
    group: "company",
    description:
      "Call +91 98430 77907 or WhatsApp Universal Fire Safety Equipments. Offices in Coimbatore (R G Street) and Chennai (Korattur). Available 24/7.",
    lede: "Call, WhatsApp or visit either office. We're available 24/7.",
    image: img("99830-1024x585-1.webp", "Fire extinguisher ready on its stand"),
    blocks: [{ type: "enquiry" }],
  },

  /* --- Products ---------------------------------------------------------- */
  {
    slug: "products",
    label: "Products",
    title: "Products",
    group: "company",
    description:
      "ISI & MMD approved fire extinguishers, fire alarm, hydrant, burglar alarm and suppression systems, safety signs and equipment — supplied and installed across Tamil Nadu.",
    lede: "Firefighting equipment of high performance and premium quality — ==ISI & MMD approved== CO2, ABC, mechanical foam, water CO2 and trolley-type extinguishers, every variety of hydrant valve, clean-agent extinguishers, branch pipes, hose reels, couplings, dry risers, monitors, shut-off nozzles and fire alarm systems.",
    image: img("Fire-Extinguisher-Pic11.webp", "Row of red fire extinguishers"),
    blocks: [
      {
        type: "statement",
        first: "From",
        second: "to hydrants",
        media: img("Fire-Extinguisher-Pic11.webp", "Row of red fire extinguishers"),
      },
      {
        type: "children",
        heading: "Everything we supply and install",
        slugs: [
          "fire-extinguisher",
          "types-of-fire-extinguisher",
          "fire-alarm-system",
          "fire-hydrant-system",
          "burglar-alarm-system",
          "fire-safety-signs",
          "kitchen-fire-suppression-system",
          "tube-based-fire-suppression-system",
          "fire-safety-equipment",
        ],
      },
    ],
  },
  {
    slug: "fire-extinguisher",
    label: "Fire extinguishers",
    title: "Fire extinguishers",
    group: "products",
    description:
      "Fire extinguisher dealers in Chennai & Coimbatore: every certified type for fire classes A, B, C, D and K, with refilling and hydrostatic testing.",
    lede: "Fire extinguisher dealers in Chennai & Coimbatore — every certified type, supplied, refilled and serviced.",
    image: img("Fire-Extinguisher-Pic11.webp", "Row of red fire extinguishers"),
    blocks: [
      {
        type: "prose",
        heading: "Fire extinguisher dealers in Chennai & Coimbatore",
        body: [
          "As leading fire extinguisher dealers in Chennai and Coimbatore, we supply all types of certified extinguishers, so you get the right fire defence for your specific fire class (A, B, C, D, K).",
          "We offer complete fire extinguisher service in Chennai and Coimbatore, including ==refilling and hydrostatic testing==, for reliable defence and compliance.",
        ],
        image: img("Fire-Extinguisher-Pic11.webp", "Row of red fire extinguishers"),
      },
      {
        type: "points",
        heading: "Fire extinguishers don't work universally",
        intro:
          "Each extinguisher is meant for specific types of fire, and is graded with a combination of letters and numbers.",
        items: [
          { title: "Class A", text: "Ordinary combustibles such as wood, paper and cloth." },
          { title: "Class B", text: "Flammable liquids." },
          { title: "Class C", text: "Electrical fires." },
          { title: "Class D", text: "Combustible metals." },
          { title: "Class K", text: "Kitchen fires involving cooking oils and fats." },
        ],
      },
      {
        type: "prose",
        heading: "Agents for every class",
        body: [
          "Extinguishers also differ by the agent they carry, and each agent suits different classes of fire.",
          "A ==CO2 fire extinguisher is recommended for electrical fires==. Our fire extinguisher prices are affordable — see the [types of fire extinguisher](#types-of-fire-extinguisher) available.",
        ],
        bullets: ["Water", "Dry powder", "Foam", "Carbon dioxide (CO2)", "Wet chemical"],
      },
      {
        type: "prose",
        heading: "Your trusted fire extinguisher dealers in Chennai",
        body: [
          "When it comes to safety in Chennai and Coimbatore, choosing the right fire protection is non-negotiable. Universal Fire Safety Equipments is one of the top fire extinguisher dealers in Chennai, providing ==certified, high-quality fire extinguishers== for residential, commercial and industrial needs.",
          "As your fire extinguisher supplier in Chennai, our team gives personal advice so you choose the correct type and size of extinguisher to meet local regulations and maximise safety. Contact us for a free consultation.",
        ],
        image: img("fire-extinguisher.webp", "Fire extinguisher mounted on a wall bracket"),
      },
      {
        type: "points",
        heading: "Placement and maintenance for effective fire defence",
        intro: "To fight fires effectively, you need to know where fire extinguishers should be placed.",
        items: [
          {
            title: "Placement analysis",
            text: "We analyse fire extinguisher placement against your building's structure for better defence and protection.",
          },
          {
            title: "Local codes",
            text: "Local codes and other rules specify where extinguishers must sit within a building. We keep you up to date.",
          },
          {
            title: "Regular inspections",
            text: "We inspect your building to confirm your protection and the placement of every extinguisher. Call us for fire safety inspections.",
            href: "#amc",
          },
          {
            title: "Always within reach",
            text: "Extinguishers must always be accessible and close to every possible source of ignition, which cuts stress in an emergency.",
          },
        ],
      },
      {
        type: "points",
        heading: "Safety standards",
        intro:
          "Fire safety standards set out maintenance checks. Every extinguisher must also be ==mounted on a wall bracket== for easy retrieval — otherwise it can cause delays in an emergency.",
        items: [
          { title: "Pressure check", text: "The gauge shows the pressure inside each extinguisher." },
          { title: "Signs of tampering", text: "Look for any visible signs of tampering." },
          { title: "Safety pins", text: "Inspect the condition of the safety pins, so the unit works when it is actually needed." },
        ],
      },
      {
        type: "prose",
        heading: "Training for an effective fire response",
        body: [
          "Everyone should know how to handle a fire extinguisher — it matters most in an emergency. We teach and guide you to handle fire safety equipment.",
          "Knowing how to use an extinguisher can make the difference. One example is the widely taught ==PASS approach: Pull, Aim, Squeeze and Sweep==. Read about the importance and uses of a [fire hydrant system](#fire-hydrant-system).",
        ],
        image: img("fire-fighting-training-1.webp", "Trainees practising with a fire extinguisher"),
      },
    ],
  },
  {
    slug: "types-of-fire-extinguisher",
    label: "Types of fire extinguisher",
    title: "Types of fire extinguisher",
    group: "products",
    description:
      "Types of fire extinguisher available in Chennai and Coimbatore — ABC, modular, trolley, foam, CO2, dry powder and water — with full performance data.",
    lede: "Your complete guide to the types of fire extinguisher available in Chennai and Coimbatore, with full performance data.",
    image: img("1-1-e1706010589112.webp", "ABC stored-pressure fire extinguisher"),
    blocks: [
      {
        type: "prose",
        body: [
          "Searching for the right type of fire extinguisher in Chennai or Coimbatore for your home, office or industrial space? Choosing the correct type is the first and most critical step in effective fire safety. Universal Fire Safety Equipments supplies every certified type, so you meet all ==BIS and local safety regulations==.",
        ],
        bullets: [
          "ABC stored pressure type",
          "ABC modular type",
          "Trolley mounted ABC & BC type",
          "Mechanical foam type",
          "Carbon dioxide (CO2)",
          "Dry powder type",
          "Water type",
        ],
      },
      {
        type: "specs",
        heading: "ABC stored pressure type",
        suitable:
          "Class A, B & C fires — paper, wood, cloth, plastics; petrol, diesel, paints, chemicals, petroleum products; LPG and natural gas; electrical and machinery fires.",
        text: "The ABC dry powder extinguisher is the most versatile and commonly available type in Chennai.",
        image: img("1-1-e1706010589112.webp", "ABC stored-pressure fire extinguisher"),
        rows: [
          ["Capacity", "1 kg", "2 kg", "4 kg", "6 kg", "9 kg"],
          ["Minimum jet range", "2 m", "4 m", "6 m"],
          ["Minimum discharge time", "8 s", "15 s", "23 s"],
          ["Maximum discharge time", "10 s", "20 s", "30 s"],
          ["Minimum discharge", "85 %"],
        ],
      },
      {
        type: "specs",
        heading: "ABC modular type — automatic ceiling & wall mount",
        image: img("2-1-e1706010680292.webp", "ABC modular automatic fire extinguisher"),
        columns: ["ABC 5 kg", "ABC 10 kg"],
        rows: [
          ["Media", "MAP powder"],
          ["Capacity", "5 kg", "10 kg"],
          ["Area coverage", "3 m approx."],
          ["Test pressure", "30 bar"],
          ["Anti-corrosive treatment", "Powder coated"],
          ["Shell diameter", "230 mm"],
          ["Overall height", "350 mm"],
          ["Charged weight", "9.5 kg", "10 kg"],
          ["Bulb temperature", "68 °C"],
          ["Charged pressure", "15 bar"],
          ["Mounting", "Ceiling / wall"],
        ],
      },
      {
        type: "specs",
        heading: "Trolley mounted ABC & BC type",
        suitable: "Class A, B & C — flammable liquids, gas storage and power houses.",
        image: img("3-1-e1706010718823.webp", "Trolley-mounted fire extinguisher"),
        rows: [
          ["Capacity", "25 kg I/C", "25 kg O/C", "50 kg", "75 kg"],
          ["Minimum jet duration", "25 s", "40 s", "50 s"],
          ["Time to discharge 90 % of contents", "30 s", "50 s", "60 s"],
          ["Jet range", "5 m", "6 m", "8 m", "10 m"],
          ["Empty weight (approx.)", "24 kg", "30 kg", "60 kg", "75 kg"],
          ["Full weight (approx.)", "50 kg", "55 kg", "110 kg", "150 kg"],
          ["Working pressure", "15 bar"],
          ["Hydro test pressure", "35 bar"],
          ["Bursting pressure", "45 bar", "55 bar"],
        ],
      },
      {
        type: "specs",
        heading: "Mechanical foam type",
        suitable:
          "Class A & B — paper, wood, paints, gases, chemicals and petroleum products (oil and diesel storage tanks). Also available as cartridge type.",
        image: img("4-1-e1706010896264.webp", "Mechanical foam fire extinguisher"),
        rows: [
          ["Capacity", "9 L"],
          ["Fire rating", "4A : 34B"],
          ["Average discharge time", "50 s"],
          ["Diameter (approx.)", "180 ± 10 mm"],
          ["Filled weight (approx.)", "12.5 kg"],
          ["Empty weight (approx.)", "3.8 kg"],
          ["Operating temperature", "+5 °C to +55 °C"],
          ["Working pressure at 20 °C", "15 bar"],
          ["Maximum service pressure", "17 bar"],
          ["Test pressure", "35 bar"],
          ["Approval", "BIS"],
        ],
      },
      {
        type: "specs",
        heading: "Carbon dioxide (CO2)",
        suitable: "Class A & B — electrical panel boards, machinery and electronics.",
        text: "The CO2 extinguisher is essential for sensitive environments.",
        image: img("5-1-e1706010826281.webp", "CO2 fire extinguisher with discharge horn"),
        columns: ["Model 2", "Model 3", "Model 4.5"],
        rows: [
          ["Capacity", "2 kg", "3 kg", "4.5 kg"],
          ["Fire rating", "8B", "13B", "21B"],
          ["Average discharge time", "12 s", "14 s"],
          ["Height (approx.)", "425 mm", "470 mm", "610 mm"],
          ["Diameter (approx.)", "108 ± 10 mm", "140 ± 10 mm"],
          ["Filled weight (approx.)", "8.9 / 8.2 kg", "12.5 / 11.8 kg", "17 / 16.3 kg"],
          ["Empty weight (approx.)", "6.9 / 6.2 kg", "9.5 / 8.8 kg", "12.5 / 11.8 kg"],
          ["Operating temperature", "−30 °C to +55 °C"],
          ["Working pressure at 20 °C", "150 bar"],
          ["Maximum service pressure", "250 bar"],
          ["Approval", "BIS"],
        ],
      },
      {
        type: "specs",
        heading: "Dry powder type",
        suitable:
          "Class B & C — flammable liquids, gases, machinery and electrical fires. Also available as cartridge type.",
        image: img("6-1-e1706010866747.webp", "Dry powder fire extinguisher"),
        rows: [
          ["Capacity", "6 kg", "7 kg"],
          ["Minimum jet duration", "20 s", "25 s"],
          ["Time to discharge 90 % of contents", "25 s", "30 s"],
          ["Jet range", "4 m", "6 m"],
          ["Empty weight (approx.)", "5.2 kg", "7.05 kg"],
          ["Full weight (approx.)", "11.2 kg", "16.02 kg"],
          ["Fire rating", "3A 34B", "4A 34B"],
          ["Working pressure", "15 bar"],
          ["Hydro test pressure", "35 bar"],
          ["Bursting pressure", "55 bar"],
        ],
      },
      {
        type: "specs",
        heading: "Water type",
        suitable:
          "Class A — paper, textiles, cloth, wood and cotton storage. Also available as cartridge type.",
        text: "For general combustibles, the water extinguisher is a traditional but effective fire safety tool.",
        image: img("7-1-e1706614425378.webp", "Water-type fire extinguisher"),
        rows: [
          ["Model", "9"],
          ["Capacity", "9 L"],
          ["Fire rating", "3A"],
          ["Average discharge time", "42 s"],
          ["Height (approx.)", "575 mm"],
          ["Diameter (approx.)", "180 ± 10 mm"],
          ["Filled weight (approx.)", "12.5 kg"],
          ["Empty weight (approx.)", "3.7 kg"],
          ["Operating temperature", "+5 °C to +55 °C"],
          ["Working pressure at 20 °C", "15 bar"],
          ["Maximum service pressure", "17 bar"],
          ["Test pressure", "35 bar"],
          ["Approval", "BIS"],
        ],
      },
    ],
  },
  {
    slug: "fire-alarm-system",
    label: "Fire alarm systems",
    title: "Fire alarm systems",
    group: "products",
    description:
      "Certified fire alarm system supplier in Chennai and Coimbatore: NBC-compliant supply, installation, commissioning and AMC for offices and factories.",
    lede: "Supply, installation, commissioning and AMC — compliant with the National Building Code.",
    image: img("fir-alarm-system.webp", "Fire alarm call point and sounder"),
    blocks: [
      {
        type: "prose",
        heading: "Fire alarm system supplier in Chennai",
        body: [
          "Searching for a certified fire alarm system supplier in Chennai? Chennai's regulations demand strict adherence to safety standards. We make sure your fire alarm system in Chennai is high-performing and fully compliant with ==National Building Code (NBC)== guidelines and local fire department mandates.",
          "We're your reliable partner for every aspect of your fire alarm system in Chennai.",
        ],
        bullets: [
          "Installation experts: we install and commission every fire alarm system in Chennai for seamless integration and function.",
          "Maintenance & AMC: annual maintenance contracts keep your fire alarm system ready 24/7, preventing false alarms and system failures.",
        ],
      },
      {
        type: "prose",
        heading: "Fire alarm system supplier in Coimbatore",
        body: [
          "As an industrial and manufacturing hub, Coimbatore needs robust fire safety. We're a trusted fire alarm system supplier in Coimbatore, with solutions tailored to industrial hazards.",
          "Choose us as your fire alarm system supplier in Coimbatore for quality and reliability.",
        ],
        bullets: [
          "Industrial systems: tough, reliable fire alarm systems built to withstand the dust, heat and noise of factory floors.",
          "Factory compliance: we help Coimbatore industries pass safety audits and meet insurance requirements with certified, high-grade fire alarm systems.",
        ],
      },
      {
        type: "prose",
        heading: "Protect your property with an advanced fire alarm system",
        body: [
          "Imagine someone always on guard, ready to raise the alarm at the first hint of danger. That's what a fire alarm system does: it ==detects smoke or heat and sounds the alarm== to keep you safe. With sharp sensing and quick reactions, it's a silent guardian that keeps you from being caught off guard in an emergency.",
        ],
        image: img("Fire-detection-System-1.webp", "Fire detection control panel"),
      },
      {
        type: "specs",
        heading: "Performance data",
        rows: [
          ["Model no.", "FDNJ002U-R"],
          ["Detection principle", "Total scattered light detection"],
          ["Weight", "Approx. 2 kg"],
          ["Outside dimensions", "W305 × H235 × D94.5 mm"],
          ["Power supply voltage", "100 V AC / 24 V DC, changeover"],
          ["Power / current consumption", "Max. 30 W (100 V AC)", "Max. 550 mA (24 V DC)"],
          ["Detection range", "Light obscuration 0.001–20 %/m", "Alarm setting 0.01–20 %/m"],
          ["Indicator lamps", "7 LEDs (alarm 1, 2 & 3, power, fault, isolation, audible alarm silence)", "Bar graph", "Digital indicator"],
          ["Output signals", "Contacts rated 1 A @ 30 V DC: alarm 1 / fault, alarm 2, alarm 3", "Smoke density analogue output 4–20 mA"],
          ["Event log", "Max. 18000 events"],
        ],
      },
      {
        type: "points",
        heading: "What a fire alarm system does for you",
        items: [
          { title: "Constant vigilance", text: "Ready to detect any sign of smoke or heat that could mean a fire, like a watchful guardian." },
          { title: "Immediate alert", text: "The moment danger is detected, the system raises the alarm, so everyone knows they're in a danger zone." },
          { title: "Reliable support", text: "Monitoring services keep you protected whenever it's needed most." },
        ],
      },
      {
        type: "prose",
        body: [
          "In today's fast-paced world, protecting your property from fire hazards is critical. Our advanced fire alarm systems give you everything you need to keep your home or business safe, with fast detection, quick response and versatile features.",
        ],
        image: img("fir-alarm-system.webp", "Fire alarm call point and sounder"),
      },
      {
        type: "points",
        heading: "Important attributes",
        items: [
          {
            title: "Early detection",
            text: "Designed to detect heat, smoke and other signs of fire as quickly as possible, reducing the risk of catastrophic damage and alerting you immediately.",
          },
          {
            title: "Advanced sensing",
            text: "Advanced sensors and detectors identify potential fire hazards early and accurately, so big problems are solved while they're still small.",
          },
          {
            title: "Tailored design",
            text: "Every property is different, so we customise each system — with the expertise to design and execute an effective layout in small offices, large commercial sites or residential buildings.",
          },
          {
            title: "Integration",
            text: "Our fire alarm systems integrate with other building management and safety systems, keeping protection simple.",
          },
          {
            title: "Remote monitoring",
            text: "Check the fire safety status of your property from anywhere, at any time, and act instantly even when you're far away.",
          },
          {
            title: "Compliance and certification",
            text: "Our systems follow all applicable industry standards and regulations, keeping your property legally compliant.",
          },
        ],
      },
    ],
  },
  {
    slug: "fire-hydrant-system",
    label: "Fire hydrant systems",
    title: "Fire hydrant systems",
    group: "products",
    description:
      "Fire hydrant system dealers in Chennai and suppliers in Coimbatore: design, installation and maintenance of hydrant valves, hose reels, inlets, branch pipes and monitors.",
    lede: "Design, installation and maintenance for commercial, industrial and high-rise sites across Chennai and Coimbatore.",
    image: img("fire-hydrant-1.webp", "Fire hydrant valve and hose"),
    blocks: [
      {
        type: "prose",
        heading: "Fire hydrant system in Chennai",
        body: [
          "For commercial, industrial and high-rise residential complexes in Chennai, a reliable fire hydrant system is ==non-negotiable== for safety and regulatory compliance. As one of the top fire hydrant system dealers in Chennai, Universal Fire Safety Equipments specialises in end-to-end fire protection.",
        ],
      },
      {
        type: "prose",
        heading: "Fire hydrant system in Coimbatore",
        body: [
          "In Coimbatore's fast-growing industrial and residential landscape, a robust, working fire hydrant system is essential for protecting assets and lives. We're a leading fire hydrant system supplier in Coimbatore, delivering high-quality, dependable firefighting infrastructure.",
        ],
        image: img("FH-ACTION-800X500-1.webp", "Fire hydrant in action"),
      },
      {
        type: "points",
        heading: "Why hydrants matter",
        intro:
          "Fire hydrants are a major part of the collective approach to effective firefighting. See our [fire safety equipment](#fire-safety-equipment).",
        items: [
          { title: "Silent sentinels", text: "Fire hydrants stand guard quietly, vital to the well-being of every community." },
          {
            title: "Essential equipment",
            text: "Hydrants are essential in a fire emergency, so commercial and large buildings must have them.",
          },
        ],
      },
      { type: "parts", heading: "Hydrant system components", items: hydrantParts },
      {
        type: "prose",
        heading: "Designed and placed with intent",
        body: [
          "Fire hydrants are more than pipes. Their simple appearance hides a network of pipes, valves and connections that give easy access to running water when it's needed most.",
          "Hydrants are ==placed strategically== along streets and near buildings for a prompt, effective response to any fire. In firefighting, proximity and availability matter most — which makes hydrants central to fire safety.",
        ],
      },
      {
        type: "prose",
        heading: "Fire management is a shared effort",
        body: [
          "Knowing how to operate a hydrant in an emergency means a major fire can be brought under control quickly, protecting the people closest to it.",
          "But hydrants aren't the whole solution. They rely on local officials, fire departments and the community working together. Proper maintenance, routine inspections and clear access let fire brigades respond quickly, and everyone has a part in keeping hydrants unobstructed. Awareness of [fire safety equipment](#fire-safety-equipment) and clear spaces is a shared responsibility.",
        ],
      },
      {
        type: "points",
        heading: "Community engagement and technology",
        items: [
          { title: "Report a problem", text: "Anyone can report damage or a fault quickly — report it immediately." },
          {
            title: "Real-time information",
            text: "Smart hydrants with sensors and communications report water pressure, usage patterns and potential issues as they happen.",
          },
          {
            title: "Regular inspections",
            text: "Regular inspections and education on water-line efficiency keep systems ready. Call us for fire safety inspections.",
            href: "#amc",
          },
          {
            title: "Technology integration",
            text: "Adding technology to traditional water systems improves their efficiency and the speed of fire response.",
          },
        ],
      },
      {
        type: "prose",
        heading: "Learn how to open a fire hydrant",
        body: ["We ==train you to operate hydrants== safely, so your protection is in hands that know what to do."],
        bullets: ["Hydrants must be easy to access.", "People must know how a hydrant works.", "We train your team to make sure you're protected."],
        image: img("fire-hydrant-1.webp", "Fire hydrant valve with hose connected"),
      },
    ],
  },
  {
    slug: "burglar-alarm-system",
    label: "Burglar alarm systems",
    title: "Burglar alarm systems",
    group: "products",
    description:
      "Certified burglar alarm systems in Chennai and Coimbatore: motion sensors, magnetic contacts, gas leak and glass-break detectors, emergency switches and more.",
    lede: "Advanced security for homes and businesses in Chennai and Coimbatore.",
    image: img("motion-sensor-1.webp", "Wall-mounted motion sensor"),
    blocks: [
      {
        type: "prose",
        heading: "Burglar alarm system in Chennai",
        body: [
          "Protect your home and business with a reliable burglar alarm system in Chennai. In a major city, advanced security is a necessity, not an option. Universal Fire Safety Equipments supplies and installs ==certified burglar alarm systems== for complete peace of mind.",
        ],
      },
      {
        type: "prose",
        heading: "Burglar alarm system in Coimbatore",
        body: [
          "Our burglar alarms can be armed in ==“Away” or “Stay” mode==. Once armed, every monitored zone can detect a violation. When a signal is received, the system waits to send a further message if another zone is tripped. Entering the code on the keypad and disarming the system ends the process.",
        ],
      },
      {
        type: "parts",
        heading: "System components",
        items: [
          { name: "Motion sensors", text: "Detect movement in the protected areas.", image: img("motion-sensor-1.webp", "Motion sensor") },
          {
            name: "Magnetic contacts",
            text: "Door-position sensors for doors, windows, cupboards, air-conditioner ducts, safes and rolling shutters.",
            image: img("magnetic-contacts-1.webp", "Magnetic door contacts"),
          },
          {
            name: "Gas leak detector",
            text: "Senses LPG leaks and potential fire hazards, and raises the alarm before they become unmanageable.",
            image: img("gas-leak-detector-1.webp", "Gas leak detector"),
          },
          {
            name: "Emergency switch",
            text: "Alerts the central monitoring station in an emergency, which can send police, fire or medical services.",
            image: img("emergency-switch-1.webp", "Emergency panic switch"),
          },
          {
            name: "Smoke detector",
            text: "Early detection of potential fire, an essential part of a complete fire safety solution.",
            image: img("smoke-detector-1.webp", "Ceiling smoke detector"),
          },
          {
            name: "Glass-break detector",
            text: "Detects the sound of breaking glass, and can cover several panes at once.",
            image: img("GLASS-BREAK-DETECTOR-1.webp", "Glass-break detector"),
          },
          { name: "Key fob", text: "Arms and disarms the wireless panel.", image: img("KEY-FOB-1.webp", "Wireless key fob") },
          {
            name: "Shock sensor",
            text: "Picks up vibration and raises the alarm if an intruder tries to drill through a wall.",
            image: img("SHOCK-SENSOR-1.webp", "Shock sensor"),
          },
          {
            name: "Repeater",
            text: "Boosts the signal in areas where it is weak.",
            image: img("REPEATER-1.webp", "Wireless signal repeater"),
          },
        ],
      },
    ],
  },
  {
    slug: "fire-safety-signs",
    label: "Fire safety signs",
    title: "Fire safety signs",
    group: "products",
    description:
      "Fire safety signs for workplaces and public spaces — warning, instruction and safe-condition signs designed by a fire protection company.",
    lede: "Warnings, instructions and safe-condition signs that people actually notice.",
    image: img("Fire-safety-general-warning-signs2.jpg", "Fire safety and general warning signs"),
    blocks: [
      {
        type: "prose",
        body: [
          "Fire safety signs give health and safety information: they warn you of a hazard, give an instruction or show where safety equipment is. Signs come in several colours — usually ==red, green, yellow or blue== — and may use images, words or both.",
          "Follow the fire safety signs in your workplace and in any public space. They're there for your safety, and ignoring them can have serious consequences.",
          "Stay informed and secure with fire safety signs designed by our fire protection team to raise awareness and put safety first.",
        ],
        image: img("Fire-safety-general-warning-signs2.jpg", "Chart of fire safety and general warning signs"),
        figure: true,
      },
    ],
  },
  {
    slug: "kitchen-fire-suppression-system",
    label: "Kitchen fire suppression",
    title: "Kitchen fire suppression",
    group: "products",
    description:
      "Pre-engineered wet-chemical kitchen fire suppression for appliance, hood and duct grease fires. UL 300 listed, NFPA 17A and NFPA 96 compliant.",
    lede: "A pre-engineered system for appliance, hood and duct grease fires.",
    image: img("Kitchen-Fire-Suppression-System.png", "Kitchen fire suppression system over a cooking line"),
    blocks: [
      {
        type: "prose",
        body: [
          "A kitchen fire suppression system is a pre-engineered solution for appliance, ventilation hood and duct grease fires, designed for maximum hazard protection, reliability and installation efficiency.",
          "Automatic or manual activation releases a ==potassium carbonate solution (wet chemical)== over the protected area as fine droplets, suppressing the fire and helping prevent re-ignition after discharge. A layer of foam covers the oil pan, cutting off oxygen and stopping re-ignition.",
        ],
        image: img("Kitchen-Fire-Suppression-System.png", "Kitchen fire suppression system over a cooking line"),
        figure: true,
      },
      {
        type: "certs",
        heading: "Certifications",
        intro: "Every kitchen fire suppression system meets the strictest industry standards.",
        items: [
          "CE 0029 mark",
          "UL 300 listed — fire extinguishing systems for protection of restaurant cooking areas",
          "ISO 9001:2008 — quality assurance certification",
          "ANSI / NFPA 17A — standard for wet chemical extinguishing systems",
          "ANSI / NFPA 96 — ventilation control and fire protection of commercial cooking operations",
        ],
        image: img("icns-e1704967638153.png", "Certification marks: CE, UL, ISO and NFPA"),
      },
      {
        type: "prose",
        heading: "Components",
        body: ["Cylinder, detection, nozzles and manual release — the parts that make up the system."],
        image: img("components-1.png", "Diagram of kitchen fire suppression system components"),
        figure: true,
      },
      {
        type: "prose",
        heading: "Features and benefits",
        body: [
          "A simple, easy-to-maintain system that protects kitchens in hotels, restaurants and public institutions with a high fire risk.",
        ],
        bullets: [
          "Fast fire detection",
          "Automatic and manual operation",
          "Dual action: suppresses the fire and cuts off appliance energy (gas and electric)",
          "Maximum extinguishing coverage",
          "Cost-effective",
          "Easy kitchen clean-up after discharge",
          "Stainless-steel-friendly suppressant",
          "Biodegradable, environmentally friendly agents",
          "Fast, easy recharge after discharge",
        ],
      },
    ],
  },
  {
    slug: "tube-based-fire-suppression-system",
    label: "Tube-based fire suppression",
    title: "Tube-based fire suppression",
    group: "products",
    description:
      "Direct and indirect tube-based fire suppression for electrical panels: detection tubing bursts at the fire and releases agent exactly where it is needed.",
    lede: "Detection tubing that bursts at the fire and suppresses it at the source.",
    image: img("TUBE3-1.png", "Tube-based fire suppression system in an electrical panel"),
    blocks: [
      {
        type: "prose",
        heading: "Working principle",
        body: [
          "A direct system works very simply. ==Fire detection tubing== runs through every area where overheating, sparks and fire are possible. If a fire starts in a panel, the section of tube nearest the fire bursts and releases chemical only on that area.",
        ],
      },
      {
        type: "parts",
        heading: "Three ways to install it",
        items: [
          {
            name: "Direct tube suppression",
            text: "The tube itself is the nozzle: the section nearest the fire bursts and discharges chemical on that spot alone.",
            image: img("tube1-1.png", "Direct tube suppression system diagram"),
          },
          {
            name: "Indirect tube suppression",
            text: "The bursting tube activates the cylinder valve, and the chemical is released from a nozzle inside the panel, flooding it completely. For closed areas only.",
            image: img("TUBE2-1.png", "Indirect tube suppression system diagram"),
          },
          {
            name: "Tube + smoke detection",
            text: "With tube detection, chemical discharges at that spot. With smoke detection, the cylinder valve operates and the nozzle floods the complete panel.",
            image: img("TUBE3-1.png", "Tube suppression with smoke detection diagram"),
          },
        ],
      },
    ],
  },
  {
    slug: "fire-safety-equipment",
    label: "Fire safety equipment",
    title: "Fire safety equipment",
    group: "products",
    description:
      "Fire safety equipment dealers in Chennai and suppliers in Coimbatore: supply, installation, commissioning, refilling, maintenance, compliance and training.",
    lede: "Supply, installation, refilling and training — for every kind of site in Chennai and Coimbatore.",
    image: img("99830-1024x585-1.webp", "Fire extinguisher ready on its stand"),
    blocks: [
      {
        type: "prose",
        heading: "Your fire safety equipment partner in Chennai",
        body: [
          "Looking for reliable fire safety equipment dealers in Chennai? Our Chennai team provides full-service solutions across the metropolitan area.",
        ],
        bullets: ["Fire safety equipment in Chennai", "Installation & commissioning", "Refilling & maintenance"],
      },
      {
        type: "prose",
        heading: "Fire safety equipment solutions in Coimbatore",
        body: ["For the industrial and corporate sector, we're a trusted fire safety equipment supplier in Coimbatore."],
        bullets: ["Fire safety equipment in Coimbatore", "Compliance", "Training"],
      },
      {
        type: "prose",
        heading: "Why fire safety equipment matters",
        body: [
          "Emergencies can strike at any second. Fire protection systems are the unsung heroes that stand guard over society, and understanding these tools is how we build a ==safe environment for people and property==.",
          "Each component tackles a different part of the risk, from [fire extinguishers](#fire-extinguisher) and fire alarms to smoke detectors and [fire hydrant systems](#fire-hydrant-system). Extinguishers, with their many classes, give a focused response to each kind of fire; alarms and smoke detectors act as vigilant sentinels, detecting the earliest signs of fire and alerting occupants — the precious seconds a quick reaction needs.",
        ],
        image: img("Fire-Safety-2.webp", "Fire safety equipment on site"),
      },
      {
        type: "points",
        heading: "Integrated for complete protection",
        intro: "The best protection goes beyond individual components to an integrated fire protection system.",
        items: [
          {
            title: "Layered protection",
            text: "Combining fire safety equipment seamlessly creates layered protection that addresses fire hazards from every angle.",
          },
          {
            title: "Real-time information",
            text: "Smart hydrants with sensors and communications report water pressure, usage patterns and potential issues as they happen.",
          },
          {
            title: "Alarms where they count",
            text: "Strategically placed fire alarms and smoke detectors complete the system. Connect with us for fire safety inspections.",
            href: "#contact",
          },
          { title: "Technology upgrades", text: "Bring the technology of your fire safety equipment up to date with us." },
        ],
      },
      {
        type: "prose",
        heading: "Putting fire safety measures into practice",
        body: [
          "Enforcing fire protection measures takes a strategic approach. Knowing how to operate extinguishers, respond to alarms and follow evacuation procedures makes a real difference in reducing risk and ensuring a safe outcome.",
        ],
        bullets: [
          "Regular inspections and maintenance keep every part in working order, ready for an emergency.",
          "Training people to use fire safety devices correctly is a critical step.",
        ],
        image: img("99830-1024x585-1.webp", "Fire extinguisher ready on its stand"),
      },
    ],
  },

  /* --- Services ---------------------------------------------------------- */
  {
    slug: "services",
    label: "Services",
    title: "Services",
    group: "company",
    description:
      "Fire safety services in Coimbatore and Chennai: annual maintenance contracts, fire extinguisher refilling, fire safety training and fire licence applications.",
    lede: "Annual maintenance, refilling, training and fire licences — handled by one certified team.",
    image: img("RS17239_Fire-marshal-checking-fire-extinguishers1-1.jpg", "Fire marshal checking fire extinguishers"),
    blocks: [{ type: "children", heading: "What we look after", slugs: ["amc", "refilling-services", "training", "fire-licence"] }],
  },
  {
    slug: "amc",
    label: "AMC",
    title: "Annual maintenance contract",
    group: "services",
    description:
      "Fire safety AMC in Coimbatore and Chennai: regular inspection, testing and maintenance of extinguishers, hydrants, smoke detectors, alarms and emergency lighting.",
    lede: "Regular inspection, testing and maintenance — so your equipment is ready on the day it's needed.",
    image: img("RS17239_Fire-marshal-checking-fire-extinguishers1-1.jpg", "Fire marshal checking fire extinguishers"),
    blocks: [
      {
        type: "prose",
        body: [
          "Keep your fire safety equipment effective for longer with our Annual Maintenance Contract (AMC). The package covers ==regular inspection, testing and maintenance== of fire extinguishers, fire hydrants, smoke detectors, fire alarms and emergency lighting.",
          "Our technicians check every unit thoroughly for function, compliance with safety standards and a fast response in an emergency. With our AMC your equipment stays in peak condition, risks stay low and your premises stay safe.",
          "Don't compromise on safety — choose our AMC for reliable, proactive, hassle-free fire protection.",
        ],
        image: img("RS17239_Fire-marshal-checking-fire-extinguishers1-1.jpg", "Fire marshal checking fire extinguishers"),
      },
    ],
  },
  {
    slug: "refilling-services",
    label: "Refilling",
    title: "Refilling",
    group: "services",
    description:
      "Fire extinguisher refilling in Chennai and Coimbatore for all types and brands — ABC, CO2, foam and water — to BIS standards with hydrostatic testing.",
    lede: "Every model available in India, refilled to BIS standards.",
    image: img("refilling-of-fire-extinguishers-1.webp", "Fire extinguishers being refilled"),
    blocks: [
      {
        type: "prose",
        heading: "Reliable fire extinguisher refilling in Chennai and Coimbatore",
        body: [
          "A discharged or expired fire extinguisher is a risk you cannot afford. If you're searching for “fire extinguisher refilling near me” in Chennai, you've found your partner. Universal Fire Safety Equipments offers prompt, certified and cost-effective fire extinguisher refilling in Chennai for ==all types and brands==, including ABC, CO2, foam and water.",
        ],
        image: img("refilling-of-fire-extinguishers-1.webp", "Fire extinguishers being refilled"),
      },
      {
        type: "points",
        heading: "Why choose our refilling service",
        items: [
          { title: "Certified service", text: "We adhere strictly to BIS standards for all refilling and hydrostatic testing." },
          { title: "Quick turnaround", text: "Your safety is time-sensitive, so we offer fast service across Chennai." },
          { title: "Full inspection", text: "Every refill includes a full inspection; each unit is pressure-tested and tamper-sealed." },
          {
            title: "AMC options",
            text: "Ask about our annual maintenance contracts for hassle-free, scheduled refilling and servicing.",
            href: "#amc",
          },
        ],
      },
      {
        type: "prose",
        body: [
          "Keep your fire safety equipment ready with refilling for ==every model available in India==. Certified technicians refill each extinguisher with the correct extinguishing agent, to national safety standards. Whether it's ABC, CO2 or foam, we refill all types, quickly and efficiently, so your extinguishers stay reliable and your premises stay compliant.",
          "Don't wait until it's too late. Make sure your first line of defence works — call us to schedule your fire extinguisher recharging.",
        ],
      },
    ],
  },
  {
    slug: "training",
    label: "Training",
    title: "Training",
    group: "services",
    description:
      "Fire safety training in Coimbatore and Chennai: hands-on firefighting training, fire drills and evacuation drills at your premises.",
    lede: "Firefighting training, fire drills and evacuation drills — at your premises.",
    image: img("WhatsApp-Image-2024-01-12-at-4.15.41-PM.jpeg", "Fire safety training session"),
    blocks: [
      {
        type: "prose",
        body: [
          "Give your team essential life-saving skills with our fire safety training. Expert instructors run ==hands-on sessions== covering fire prevention, evacuation procedures and the correct use of firefighting equipment.",
          "Training meets industry regulations, so participants can handle emergencies with confidence. From spotting hazards to running efficient evacuation drills, the curriculum builds a culture of safety in your workplace. Invest in your staff and your premises — because preparedness saves lives.",
        ],
      },
      {
        type: "gallery",
        images: [
          img("WhatsApp-Image-2024-01-12-at-4.15.41-PM.jpeg", "Trainees learning to use a fire extinguisher"),
          img("WhatsApp-Image-2024-01-12-at-4.15.42-PM.jpeg", "Instructor demonstrating fire safety equipment"),
          img("WhatsApp-Image-2024-01-12-at-4.15.43-PM.jpeg", "Live fire drill during training"),
          img("WhatsApp-Image-2024-01-12-at-4.15.42-PM-1.jpeg", "Group fire safety training"),
          img("WhatsApp-Image-2024-01-12-at-4.15.43-PM-1.jpeg", "Trainee putting out a practice fire"),
        ],
      },
    ],
  },
  {
    slug: "fire-licence",
    label: "Fire licence",
    title: "Fire licence",
    group: "services",
    description:
      "Tamil Nadu fire licence applications handled end to end: inspections, paperwork and liaison with the authorities, by Universal Fire Safety Equipments.",
    lede: "Your fire licence application, handled from start to finish.",
    image: img("Tamil-Nadu-Fire-License-1.webp", "Tamil Nadu fire licence"),
    blocks: [
      {
        type: "prose",
        body: [
          "Get peace of mind and legal compliance with our fire licence service. We handle the ==fire licence application from start to finish==, so your premises meet safety regulations.",
          "We guide you through the application, carry out the necessary inspections and liaise with the authorities to secure your licence efficiently. With our help, your establishment shows its commitment to safety, reducing risk and potential damage.",
        ],
        image: img("Tamil-Nadu-Fire-License-1.webp", "Tamil Nadu fire licence"),
      },
    ],
  },
];

export const page = (slug: string) => pages.find((p) => p.slug === slug);

/* ==========================================================================
   One page: the nav jumps between its sections. Products and services open
   as sheets (components/Detail.tsx) — their old WordPress URLs redirect to
   /#<slug> (public/.htaccess), which opens the matching sheet.
   ========================================================================== */

export const nav = {
  links: [
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "Specifications", href: "#specs" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ] as Link[],
};

export const products = pages.filter((p) => p.group === "products");
export const services = pages.filter((p) => p.group === "services");

/* ==========================================================================
   Home
   ========================================================================== */

export const home = {
  hero: {
    lines: ["Ready before", "the spark."],
    support: "Fire safety equipment and systems for all of Tamil Nadu.",
    cta: { label: "Book a site survey", text: "Hi Universal Fire, I'd like to book a fire safety site survey." },
  },
  fire: {
    heading: "No.1 fire safety company in Coimbatore and Chennai",
    body: [
      "An organisation with advanced facilities ==approved by BIS==.",
      "Universal Fire Safety is one of the leading fire extinguisher dealers in Coimbatore, Chennai and ==all over Tamil Nadu==, with products designed for high performance and rapid fire knockdown against light, ordinary and high hazards in every industry.",
    ],
  },
  intro: {
    heading: "Firefighting equipment of premium quality",
    body: [
      "We supply ==ISI & MMD approved== CO2, ABC, mechanical foam, water CO2 and trolley-type fire extinguishers, every variety of fire hydrant valve, clean-agent extinguishers, branch pipes, fire hose reels, couplings and hydrant accessories, dry risers, monitors, shut-off nozzles and fire alarm systems.",
      "Universal Fire is one of the leading and trusted manufacturers of fire safety equipment in Chennai, Coimbatore and all over Tamil Nadu.",
    ],
    image: img("fire-manufact1-e1707120916289.webp", "Fire extinguishers lined up at the Universal Fire facility"),
  },
  sectors: {
    heading: "What protects your kind of building",
    intro:
      "The right agent depends on what's inside. These are the extinguishers we recommend by sector — and our team installs [fire alarm](#fire-alarm-system) and [fire hydrant](#fire-hydrant-system) systems to match.",
    items: [
      { name: "Commercial buildings", types: ["ABC dry powder", "K class", "CO2"], image: img("sector-commercial.jpg", "Glass office towers in a commercial district") },
      { name: "Offices", types: ["ABC dry powder", "Clean agent", "CO2"], image: img("sector-office.jpg", "Meeting room in a modern office") },
      { name: "Hospitals", types: ["Clean agent (SS)", "Panel flooding system", "Foam"], image: img("sector-hospital.jpg", "Hospital ward with patient beds") },
      { name: "Hotels & restaurants", types: ["Water mist", "Clean agent", "CO2"], image: img("sector-kitchen.jpg", "Stainless-steel commercial kitchen") },
      { name: "Schools & colleges", types: ["Water mist", "ABC dry powder", "Foam"], image: img("sector-school.jpg", "College lecture hall") },
      { name: "Factories", types: ["Water mist", "ABC dry powder", "Foam"], image: img("016A4576-1024x683-1.webp", "Factory floor with extinguishers in production") },
    ],
  },
  buy: {
    heading: "Top-rated fire extinguishers in Chennai and Coimbatore",
    body: [
      "We're top-rated fire extinguisher dealers in Chennai, with ABC, CO2, foam and water-type extinguishers — plus the [fire extinguisher refilling](#refilling-services) that keeps your premises compliant.",
      "From fire alarm installation to fire hydrants and sprinkler systems, our ==certified engineers== deliver complete fire protection services for every sector, minimising property damage and protecting lives.",
    ],
    image: img("Fire-Safety-2.webp", "Fire safety equipment ready for use"),
  },
  equipment: {
    heading: "Hydrant equipment, end to end",
    body: "Valves, hose reels, inlets, branch pipes, sprinklers and monitors — supplied, installed and maintained.",
    items: hydrantParts,
  },
  why: {
    heading: "Why we are different",
    body: "We're a professional fire safety company in Chennai and Coimbatore, backed by well-qualified engineers and technicians who are experts in every aspect of fire protection. Our team works ==around the clock== to deliver quality products and reliable service.",
    items: [
      {
        title: "Protection",
        text: "Choosing the right fire protection for a specific situation starts with evaluating the fire hazards you might face.",
        href: "#fire-safety-equipment",
      },
      {
        title: "Inspection",
        text: "Fire extinguishers in all non-residential buildings must be serviced and inspected every year by a professional fire protection company.",
        href: "#amc",
      },
      {
        title: "Precaution",
        text: "Proactive measures, like correct extinguisher placement, ensure a swift, effective response in an emergency.",
        href: "#fire-extinguisher",
      },
    ],
  },
  inside: {
    heading: "Inside every extinguisher we supply",
    body: "Eleven parts, each one checked on every service visit. Scroll to take one apart.",
    // Same order as PARTS in components/gl/exploded.ts.
    parts: [
      { name: "Operating lever", note: "Squeeze to discharge, release to stop." },
      { name: "Carrying handle", note: "Carry it here — never by the hose." },
      { name: "Safety pin", note: "Pull the pin — the P in PASS." },
      { name: "Pressure gauge", note: "Needle in the green: charged and ready." },
      { name: "Valve head", note: "Holds the charge until the lever is squeezed." },
      { name: "Hose and nozzle", note: "Aim at the base of the fire, sweep side to side." },
      { name: "Siphon tube", note: "Draws powder up from the bottom of the cylinder." },
      { name: "ABC dry powder", note: "MAP-based agent for class A, B and C fires." },
      { name: "Steel cylinder", note: "Test pressure 35 bar. BIS approved." },
      { name: "Inspection tag", note: "Dated and signed on every service visit." },
      { name: "Base cup", note: "Moulded foot that keeps the cylinder off damp floors." },
    ],
  },
  licence: { first: "Need a", second: "fire licence?", media: img("Tamil-Nadu-Fire-License-1.webp", "Tamil Nadu fire licence"), href: "#fire-licence" },
};
