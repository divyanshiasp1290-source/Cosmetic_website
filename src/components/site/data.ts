import svcMicroneedling from "../../images/Microneedling 3.PNG";
import svcPeel from "../../images/Chemical peels.png";
import svcLaser from "../../images/Laser Hair.PNG";
import svcHydrafacial from "../../images/Hydrafacial.png";
import svcRejuvenation from "../../images/face_sculpt 2.PNG";
import svcIpl from "../../images/IPL treatment.PNG";
import svcDermaplaning from "../../images/Dermaplaning 2.png";
import svcLed from "../../images/LED light therapy.png";
import svcMicroderm from "../../images/microdermabrasion 2.PNG";
import svcHighFrequency from "../../images/high_frequency.PNG";

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  benefits: string[];
  result: string;
  image: string;
};

export const services: Service[] = [
  {
    slug: "microneedling",
    title: "Microneedling",
    short: "Boosts collagen for smoother, healthier-looking skin.",
    description:
      "Microneedling is a minimally invasive treatment that stimulates your skin's natural collagen production. It helps improve fine lines, acne scars, uneven texture, and overall skin tone, leaving your skin looking smoother, firmer, and more refreshed.",
    benefits: [
      "Improves skin texture",
      "Reduces the appearance of acne scars",
      "Boosts natural collagen production",
      "Promotes healthier, glowing skin",
    ],
    result:
      "Most patients notice smoother, healthier-looking skin within 2–4 weeks. For the best results, a series of treatments may be recommended based on your skin concerns.",
    image: svcMicroneedling,
  },
  {
    slug: "chemical-peels",
    title: "Chemical Peels",
    short: "Refreshes your skin for a brighter, clearer complexion.",
    description:
      "Our chemical peels are tailored to your skin type and concerns to gently remove dead skin cells and encourage healthy skin renewal. They can help improve pigmentation, uneven skin tone, fine lines, and dullness, leaving your skin looking smoother and more radiant.",
    benefits: [
      "Reduces pigmentation and sun damage",
      "Improves skin texture",
      "Evens out skin tone",
      "Reveals brighter, healthier-looking skin",
    ],
    result:
      "Many patients notice brighter, smoother skin within a few days. Results continue to improve over the following weeks as your skin naturally renews itself.",
    image: svcPeel,
  },
  {
    slug: "ipl-treatments",
    title: "IPL Treatments",
    short: "Helps reduce pigmentation, redness, and sun damage.",
    description:
      "IPL (Intense Pulsed Light) treatment targets common skin concerns such as sun damage, pigmentation, redness, and uneven skin tone. It's a gentle, non-invasive treatment that helps restore a clearer, brighter, and more even complexion.",
    benefits: [
      "Reduces pigmentation and sunspots",
      "Minimises redness",
      "Evens out skin tone",
      "Improves overall skin clarity",
    ],
    result:
      "Many patients notice clearer, brighter skin after a few sessions. For the best results, a series of 3–5 treatments may be recommended, depending on your skin concerns.",
    image: svcIpl,
  },
  {
    slug: "laser-hair-removal",
    title: "Laser Hair Removal",
    short: "Long-lasting hair reduction for smoother skin.",
    description:
      "Our laser hair removal treatment safely targets unwanted hair while protecting the surrounding skin. It's a quick and effective way to achieve smoother skin, reduce ingrown hairs, and enjoy long-lasting results.",
    benefits: [
      "Reduces unwanted hair growth",
      "Leaves skin feeling smoother",
      "Helps prevent ingrown hairs",
      "Provides long-lasting results",
    ],
    result:
      "Many patients notice a reduction in hair growth after the first few sessions. A series of treatments is recommended for the best long-term results.",
    image: svcLaser,
  },
  {
    slug: "hydrafacial",
    title: "Hydrafacial",
    short: "Deep cleansing and hydration for an instant glow.",
    description:
      "Hydrafacial is a gentle, non-invasive treatment that cleanses, exfoliates, and hydrates your skin in one session. It helps remove impurities, improve skin texture, and leave your complexion feeling refreshed, healthy, and glowing.",
    benefits: [
      "Deeply cleanses and hydrates the skin",
      "Helps minimise the appearance of pores",
      "Improves skin texture and radiance",
      "No downtime required",
    ],
    result:
      "Your skin will look cleaner, smoother, and more radiant immediately after treatment, making it a great choice before a special event.",
    image: svcHydrafacial,
  },
  {
    slug: "high-frequency-therapy",
    title: "High-Frequency Therapy",
    short: "Calms breakouts and supports clearer, healthier skin.",
    description:
      "uHigh-Frequency Therapy is a gentle treatment that helps reduce acne-causing bacteria, calm inflammation, and support your skin's natural healing process. It's ideal for improving breakouts while promoting a clearer, healthier complexion.",
    benefits: [
      "Helps reduce inflammation",
      "Supports faster skin healing",
      "Clears clogged pores and congestion",
      "Promotes a brighter, healthier complexion",
    ],
    result:
      "Many patients notice calmer, healthier-looking skin after their first session. For long-lasting improvements, a series of treatments may be recommended.",
    image: svcHighFrequency,
  },
  {
    slug: "microdermabrasion",
    title: "Microdermabrasion",
    short: "Gently exfoliates to reveal fresher, smoother skin.",
    description:
      "Microdermabrasion is a gentle exfoliating treatment that removes dead skin cells to improve skin texture and reveal a brighter, smoother complexion. It's a great option for refreshing dull skin with little to no downtime.",
    benefits: [
      "Smooths rough skin texture",
      "Brightens dull skin",
      "Helps minimise the appearance of pores",
      "Leaves skin feeling soft and refreshed",
    ],
    result:
      "Many patients notice smoother, brighter skin after just one treatment. A series of sessions can provide even better, longer-lasting results.",
    image: svcMicroderm,
  },
  {
    slug: "face-sculpt",
    title: "Face Sculpt",
    short: "Enhances your natural facial contours without surgery.",
    description:
      "Face Sculpt is a non-surgical treatment designed to improve facial definition and create a more refreshed appearance. By focusing on your natural features, it helps lift, contour, and restore balance while maintaining natural-looking results.",
    benefits: [
      "Enhances natural facial contours",
      "Softens the appearance of fine lines",
      "Improves facial balance and definition",
      "Delivers natural-looking results",
    ],
    result:
      "You'll notice a more refreshed and defined appearance after treatment. Results continue to improve over time and vary depending on your personalised treatment plan.",
    image: svcRejuvenation,
  },
  {
    slug: "dermaplaning",
    title: "Dermaplaning",
    short: "Removes dead skin and peach fuzz for an instant glow.",
    description:
      "Dermaplaning is a gentle exfoliation treatment that removes dead skin cells and fine facial hair, leaving your skin smoother, brighter, and better prepared to absorb skincare products. It's also an excellent treatment for achieving a flawless makeup finish.",
    benefits: [
      "Leaves skin smooth and soft",
      "Brightens dull skin",
      "Improves skincare product absorption",
      "Creates a smooth base for makeup",
    ],
    result:
      "You'll notice smoother, brighter skin immediately after treatment with no downtime. Monthly treatments can help maintain long-lasting results.",
    image: svcDermaplaning,
  },
  {
    slug: "led-light-therapy",
    title: "LED Light Therapy",
    short: "Uses gentle light to calm, heal, and refresh your skin.",
    description:
      "LED Light Therapy is a non-invasive treatment that uses different wavelengths of light to support your skin's natural healing process. It helps reduce inflammation, improve breakouts, stimulate collagen production, and leave your skin looking healthier and more refreshed.",
    benefits: [
      "Helps reduce redness and inflammation",
      "Supports natural collagen production",
      "Improves acne-prone skin",
      "Gentle treatment with no downtime",
    ],
    result:
      "Many patients notice calmer, healthier-looking skin after a few sessions. Regular treatments can help improve skin clarity, texture, and overall appearance over time.",
    image: svcLed,
  },
];
