/*
 * Kalio — the sample texts of the shop's own pages (5 November 2026).
 *
 * About us, Terms of use and Privacy come from the shop's profiles in the
 * Selldone dashboard. molino has written none of them yet, and the owner
 * asked for full pages in the meantime, filled with general text that says
 * it is a test and not real. These are those texts; each page shows them,
 * under KalioSampleNote, only while the shop's own profile is missing.
 *
 * Nothing here is a promise: the terms do not form an agreement and the
 * policy is not the shop's policy. Dates, numbers and names in the letter
 * are marked as examples.
 */

export interface Section {
  title: string;
  text: string[];
}

export function termsSample(shop: string): { short: string[]; sections: Section[] } {
  return {
    short: [
      `${shop} sells every product on this site itself.`,
      "You pay at checkout, or on delivery where it is offered.",
      "Report a damaged or wrong item within 14 days.",
      "Each order has a message thread with our team.",
    ],
    sections: [
      {
        title: "Who we are",
        text: [
          `${shop} is an online electronics store. We sell, pack and send every product on this site ourselves.`,
        ],
      },
      {
        title: "Your account",
        text: [
          "You need an account, or a guest checkout where the shop offers one, to order. Keep your sign-in details to yourself and tell us if you think someone else has used them.",
          "Sample paragraph: a fuller explanation would go here, written in plain words, with examples of what this means for an order.",
        ],
      },
      {
        title: "Orders and prices",
        text: [
          "Prices are shown with taxes as stated at checkout. An order is placed when you confirm it, and accepted when we confirm it.",
        ],
      },
      {
        title: "Payment",
        text: [
          `You pay at checkout, or on delivery where cash on delivery is offered. Card payments are handled by the payment provider and are not stored by ${shop}.`,
        ],
      },
      {
        title: "Delivery",
        text: [
          "Delivery times and costs are shown before you pay. You can follow the order and message us from your account.",
        ],
      },
      {
        title: "Returns and refunds",
        text: [
          "If something arrives damaged or wrong, tell us from the order page within 14 days. Opened software and personal-care items can be refunded but not returned.",
        ],
      },
      {
        title: "Changes to these terms",
        text: ["We may update these terms. The date at the top shows the latest version."],
      },
    ],
  };
}

export function privacySample(shop: string): { short: string[]; sections: Section[] } {
  return {
    short: [
      "We use your details to take and deliver orders.",
      "Couriers see only what they need to deliver it.",
      "We do not sell your data.",
      "You choose which optional cookies to allow.",
    ],
    sections: [
      {
        title: "What we collect",
        text: [
          "Your name, contact details and delivery address; what you order; and how you use the shop (pages viewed, searches).",
        ],
      },
      {
        title: "Why we use it",
        text: [
          "To take and deliver your orders, to answer your messages about an order, to keep the shop secure and to improve it.",
          "Sample paragraph: a fuller explanation would go here, written in plain words, with an example for each use.",
        ],
      },
      {
        title: "Who sees it",
        text: [
          "The courier who delivers your order sees what they need to bring it. Payment providers handle card details. We do not sell your data.",
        ],
      },
      {
        title: "How long we keep it",
        text: ["Order records for as long as the law requires; your account until you close it."],
      },
      {
        title: "Your rights",
        text: ["You can see, correct, download or delete your data, and say no to marketing at any time."],
      },
      {
        title: "Cookies",
        text: ["Essential cookies keep you signed in and your cart full. Anything optional is your choice, below."],
      },
    ],
  };
}

export function aboutSample(shop: string) {
  return {
    title: "Tech, made simple to buy",
    lead: "Buying electronics should be easy: clear specs, honest prices and someone to ask. We keep the things we would recommend to a friend in one store, with one cart and one checkout.",
    text: [
      `${shop} picks every product it sells, lists its specifications in full and keeps prices plain, with the saving marked when there is one. We pack and send every order ourselves, and answer every message from the order page.`,
    ],
    values: [
      { title: "Clear prices", text: "The price you see is the one you pay, with the saving and the old price marked plainly." },
      { title: "Specs you can compare", text: "Every product lists its specifications, and Compare puts them side by side." },
      { title: "Packed with care", text: "We pack each order ourselves and tell you where it is on the way." },
      { title: "People you can reach", text: "Every order has a message thread with our team." },
    ],
    timeline: [
      { when: "Spring", text: "The first departments open. (Example.)" },
      { when: "Summer", text: "Same-day delivery starts in town. (Example.)" },
      { when: "Today", text: "Every department, one checkout. (Example.)" },
    ],
    sign: `— the ${shop} team`,
  };
}

/** A shop page's text with its markup taken out, for "is it empty?". */
export function plainText(html: string | null | undefined): string {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
