import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Dermacare Clinic" },
      {
        name: "description",
        content:
          "Privacy Policy for Dermacare Clinic. Learn how we handle your appointments, payments, and personal information in Vancouver, BC.",
      },
      { property: "og:title", content: "Privacy Policy — Dermacare Clinic" },
      {
        property: "og:description",
        content:
          "Privacy Policy for Dermacare Clinic. Learn how we handle your appointments, payments, and personal information in Vancouver, BC.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-charcoal">
      <Header />

      <main className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10 lg:pt-36 lg:pb-28">
        {/* HEADER & COMPREHENSIVE INTRO */}
        <header className="border-b border-border/70 pb-10">
          <div className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
            Dermacare Clinic · Vancouver, BC
          </div>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-charcoal">
            Privacy Policy
          </h1>

          {/* CLINICAL OVERVIEW & SCOPE */}
          <div className="mt-8 space-y-4 text-base sm:text-lg leading-relaxed text-charcoal/85">
            <p>
              At Dermacare Clinic, located at 920 W King Edward Ave, Vancouver, BC (V5Z 2E2), we
              provide boutique cosmetic dermatology and medical aesthetic treatments tailored to
              help you achieve healthy, radiant, and confident skin. We value your trust and are
              dedicated to maintaining the highest standards of privacy, security, and patient
              confidentiality.
            </p>
            <p>
              This Privacy Policy applies to personal information collected through our website, our
              online appointment booking system, consultation inquiry forms, and direct electronic
              communications. It explains what personal data we collect, how it is used to
              coordinate your appointments, our measures to protect your confidentiality, and your
              rights primarily under British Columbia&apos;s{" "}
              <em>Personal Information Protection Act</em> (PIPA), as well as Canadian federal
              privacy legislation (PIPEDA) to the extent it may apply.
            </p>
            <p className="text-sm sm:text-base text-charcoal/75">
              Dermacare Clinic does not sell or rent personal information. Personal information may
              be disclosed to service providers where reasonably necessary to provide website,
              payment, scheduling, communication, hosting, security, or related services, or where
              required or permitted by law.
            </p>
          </div>
        </header>

        {/* POLICY SECTIONS - FULL WIDTH & CLEAR HEADINGS */}
        <div className="mt-10 space-y-12 text-base leading-relaxed text-charcoal/85">
          {/* 1. Information We Collect */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We only collect personal information that is reasonably necessary to process your
              treatment appointments, check scheduling availability, verify clinic service area
              eligibility, and answer your inquiries:
            </p>
            <ul className="list-disc pl-6 space-y-2.5">
              <li>
                <strong>Personal Identification & Contact Data:</strong> Your full name, email
                address, and telephone number submitted during booking or inquiries.
              </li>
              <li>
                <strong>Service Area Verification Data:</strong> Your Canadian postal code,
                collected during the appointment booking process to verify whether your requested
                appointment is located within our Vancouver clinic&apos;s local service radius (~20
                km).
              </li>
              <li>
                <strong>Treatment Selection & Schedule Preferences:</strong> The aesthetic procedure
                of interest (including Microneedling, Chemical Peels, IPL Treatments, Laser Hair
                Removal, Hydrafacial, High-Frequency Therapy, Microdermabrasion, Face Sculpt,
                Dermaplaning, or LED Light Therapy), along with your preferred appointment date and
                time slot.
              </li>
              <li>
                <strong>Clinical Notes & Skin Concerns:</strong> Information you voluntarily provide
                regarding your skin type, treatment goals, or aesthetic history in our contact forms
                or booking notes.
              </li>
              <li>
                <strong>Payment Confirmation Records:</strong> Confirmation and transaction
                reference numbers for your $25 consultation booking deposit processed securely
                through Stripe. We do not collect, process, or store full credit card numbers on our
                servers.
              </li>
              <li>
                <strong>Technical Information:</strong> Certain technical information, such as IP
                address, browser type, device information, or server logs, may be processed
                automatically for website security, reliability, and fraud prevention.
              </li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">
              Your personal information is used strictly to provide, manage, and facilitate our
              clinic appointments and services:
            </p>
            <ul className="list-disc pl-6 space-y-2.5">
              <li>
                <strong>Appointment Coordination:</strong> Scheduling, confirming, and managing your
                aesthetic consultation and treatment appointments.
              </li>
              <li>
                <strong>Calendar Availability Checks:</strong> Checking real-time calendar
                availability via Google Calendar to prevent scheduling conflicts and double
                bookings.
              </li>
              <li>
                <strong>Deposit Processing:</strong> Verifying and processing the $25 appointment
                deposit securely via Stripe.
              </li>
              <li>
                <strong>Booking Communication:</strong> Communicating with you regarding appointment
                confirmations and responding directly to inquiries submitted through our contact
                form.
              </li>
              <li>
                <strong>Local Eligibility Checks:</strong> Verifying that appointment requests fall
                within our clinic&apos;s ~20 km Vancouver service boundary.
              </li>
              <li>
                <strong>Recordkeeping & Administrative Operations:</strong> Maintaining necessary
                scheduling, accounting, and administrative records as required for clinic operations
                and applicable legal standards.
              </li>
            </ul>
          </section>

          {/* 3. Appointment Booking & Patient Confidentiality */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              3. Appointment Booking & Patient Confidentiality
            </h2>
            <p className="mb-3">
              Our website booking engine coordinates directly with Google Calendar to display open,
              available time slots in real time.
            </p>
            <p className="mb-3">
              <strong>Patient Confidentiality:</strong> Existing calendar entries are used strictly
              to identify busy versus open slots. At no time are the names, treatment types, contact
              details, or other private information of existing clients visible or accessible to
              other visitors. Patient privacy is protected across all interactions.
            </p>
            <p>
              To ensure adequate clinical preparation, all online bookings must be reserved at least
              one day in advance (starting from the following day onward).
            </p>
          </section>

          {/* 4. Payment Processing via Stripe */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              4. Secure Payment Processing (Stripe)
            </h2>
            <p className="mb-3">
              To reserve your treatment time, a $25 deposit is collected at the time of booking. All
              payment transactions are handled through Stripe, an internationally certified, PCI-DSS
              Level 1 compliant payment processor.
            </p>
            <p className="mb-3">
              When entering payment information, you interact directly with Stripe&apos;s secure
              hosted checkout. Dermacare Clinic never collects, sees, or stores your full credit
              card number, expiration date, or CVV security code on our website or servers.
            </p>
            <p>
              Payment data is governed directly by Stripe&apos;s privacy and security terms. For
              more information, please review Stripe&apos;s Privacy Policy on their official
              website.
            </p>
          </section>

          {/* 5. Local Service Area Verification */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              5. Local Service Area Verification (Postal Code)
            </h2>
            <p className="mb-3">
              Dermacare Clinic provides personalised in-person aesthetic care from our Vancouver
              atelier at 920 W King Edward Ave.
            </p>
            <p className="mb-3">
              Our booking portal checks your Canadian postal code to verify whether the provided
              postal code falls within our intended local service area (approximately 20 km of our
              clinic).
            </p>
            <p>
              We do not use telephone area codes to determine geographic eligibility, ensuring that
              clients with out-of-province phone numbers who reside locally in the Greater Vancouver
              area can book without restriction.
            </p>
          </section>

          {/* 6. Third-Party Service Providers */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              6. Third-Party Service Providers
            </h2>
            <p className="mb-3">
              We partner with select third-party service providers solely to maintain our website
              and clinical booking infrastructure:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Stripe:</strong> Payment gateway for processing appointment deposits
                securely.
              </li>
              <li>
                <strong>Google Calendar / Google Workspace:</strong> Real-time scheduling,
                availability checks, and appointment calendar management.
              </li>
              <li>
                <strong>Web3Forms:</strong> Encrypted transmission of contact form inquiries
                directly to our clinic email.
              </li>
              <li>
                <strong>Vercel:</strong> Secure cloud hosting and web infrastructure.
              </li>
            </ul>
            <p className="mt-3">
              These providers may process personal information as necessary to provide the services
              described above and are subject to their own applicable privacy and security
              practices. Dermacare Clinic does not sell or rent personal information to third
              parties.
            </p>
          </section>

          {/* 7. Security & Data Retention */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              7. Security & Data Retention
            </h2>
            <p className="mb-3">
              We use reasonable technical and organizational safeguards appropriate to the nature of
              the information we handle to protect personal information against unauthorized access,
              loss, alteration, or misuse.
            </p>
            <p className="mb-3">
              Website communications and form submissions are protected using HTTPS/SSL/TLS
              encryption. Access to booking schedules and client inquiries is restricted strictly to
              authorized Dermacare Clinic personnel.
            </p>
            <p>
              We retain personal information only for as long as reasonably necessary to fulfill the
              purposes for which it was collected, provide ongoing services, maintain administrative
              and business records, and satisfy legal obligations under applicable law.
            </p>
          </section>

          {/* 8. Your Privacy Rights */}
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              8. Your Privacy Rights
            </h2>
            <p className="mb-3">
              Under British Columbia&apos;s <em>Personal Information Protection Act</em> (PIPA)—and
              Canadian federal privacy legislation (PIPEDA) where applicable—you have rights
              regarding the personal information we hold about you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Access:</strong> You have the right to request access to the personal
                information we hold regarding your bookings and profile.
              </li>
              <li>
                <strong>Correction:</strong> You have the right to request updates or corrections to
                inaccurate, incomplete, or outdated information.
              </li>
              <li>
                <strong>Inquiries & Concerns:</strong> You may inquire about our data handling
                policies or raise concerns regarding your personal information at any time.
              </li>
            </ul>
          </section>

          {/* 9. Privacy Enquiries & Clinic Contact */}
          <section className="border-t border-border/70 pt-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
              9. Privacy Enquiries & Clinic Contact
            </h2>
            <p className="mb-4">
              If you have any questions, requests, or concerns regarding this Privacy Policy or how
              Dermacare Clinic handles your personal information, please contact us directly:
            </p>

            <div className="space-y-1.5 text-base">
              <p className="font-semibold text-charcoal text-lg">Dermacare Clinic</p>
              <p>920 W King Edward Ave, Vancouver, BC V5Z 2E2, Canada</p>
              <p className="pt-2">
                Telephone:{" "}
                <a
                  href="tel:6043666820"
                  className="font-medium underline underline-offset-4 hover:text-[var(--rose)] transition-colors"
                >
                  604-366-6820
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@dermacareclinic.ca"
                  className="font-medium underline underline-offset-4 hover:text-[var(--rose)] transition-colors"
                >
                  info@dermacareclinic.ca
                </a>
              </p>
              <p className="text-sm text-muted-foreground pt-1">
                Clinic Hours: Monday – Sunday, 10:00 AM – 6:00 PM
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact" className="btn-gold">
                Contact Us
              </Link>
              <Link to="/booking" className="btn-ghost">
                Book a Consultation
              </Link>
            </div>

            <p className="text-xs text-muted-foreground pt-8">Last Updated: October 1, 2026</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
