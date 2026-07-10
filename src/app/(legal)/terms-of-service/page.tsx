// Placeholder legal text — replace with terms reviewed by your own counsel
// before launching.
import Link from "next/link";

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "this service";

export const metadata = {
  title: "Terms of Service",
  description: `${projectName} terms of service`,
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 font-bold text-4xl">
        {projectName} - Terms of Service
      </h1>

      <p className="mb-6 text-muted-foreground">Effective Date: [DATE]</p>

      <p className="mb-6">
        Welcome to {projectName}. These Terms of Service (&quot;Terms&quot;)
        apply to your use of the {projectName} website and the {projectName}{" "}
        services, applications, and APIs (collectively, the
        &quot;Service&quot;). By using the Service, you agree to these Terms. If
        you do not agree to these Terms, you may not use the Service.
      </p>

      <p className="mb-6">
        These Terms incorporate by reference our{" "}
        <Link className="text-primary hover:underline" href="/privacy-policy">
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Service Description</h2>

      <p className="mb-6">
        [Describe what your service does, what is included, and any important
        limitations — for example, whether it is suitable for mission-critical
        use.]
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Eligibility</h2>

      <p className="mb-6">
        You must be at least 18 years old, or the age of legal majority in your
        jurisdiction, to use the Service. You are responsible for complying with
        all laws and regulations that apply to your use of the Service.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Your Account</h2>

      <p className="mb-6">
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activity that occurs under your account. Notify
        us immediately if you suspect unauthorized use of your account. We may
        suspend or terminate accounts that violate these Terms.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Subscriptions and Billing
      </h2>

      <p className="mb-6">
        Paid plans are billed in advance on a recurring basis through our
        payment processor. Fees are non-refundable except as required by law or
        as expressly stated otherwise. You can cancel your subscription at any
        time; your plan remains active until the end of the current billing
        period. We may change pricing with reasonable advance notice.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Acceptable Use</h2>

      <p className="mb-6">
        You agree not to misuse the Service. Among other things, you may not:
        use the Service to violate any law or the rights of others; attempt to
        gain unauthorized access to the Service or its related systems;
        interfere with or disrupt the integrity or performance of the Service;
        or resell or redistribute the Service without our permission.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Your Content</h2>

      <p className="mb-6">
        You retain ownership of content you submit to the Service. You grant us
        a limited license to host, store, and process that content solely as
        needed to provide the Service. You are responsible for your content and
        represent that you have all rights necessary to use it with the Service.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Intellectual Property
      </h2>

      <p className="mb-6">
        The Service, including its software, design, and branding, is owned by
        us or our licensors and is protected by intellectual property laws.
        These Terms do not grant you any rights to our trademarks or branding.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Termination</h2>

      <p className="mb-6">
        You may stop using the Service at any time. We may suspend or terminate
        your access to the Service if you violate these Terms or if we
        reasonably believe your use poses a risk to the Service or others. Upon
        termination, provisions that by their nature should survive (including
        disclaimers, limitations of liability, and payment obligations) will
        survive.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Disclaimers</h2>

      <p className="mb-6">
        The Service is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, whether express or implied, including
        warranties of merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the Service will be
        uninterrupted, secure, or error-free.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Limitation of Liability
      </h2>

      <p className="mb-6">
        To the maximum extent permitted by law, we will not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or
        any loss of profits, revenue, data, or goodwill, arising out of or
        related to your use of the Service. Our total liability for any claim
        arising out of these Terms or the Service will not exceed the amounts
        you paid us in the twelve months before the claim arose.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Changes to These Terms
      </h2>

      <p className="mb-6">
        We may update these Terms from time to time. If we make material
        changes, we will provide notice, such as by posting the updated Terms on
        this page with a new effective date. Your continued use of the Service
        after changes take effect constitutes acceptance of the updated Terms.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Contact</h2>

      <p className="mb-6">
        Questions about these Terms? Contact us at [CONTACT EMAIL].
      </p>
    </div>
  );
}
