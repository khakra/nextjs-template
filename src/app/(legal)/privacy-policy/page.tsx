// Placeholder legal text — replace with a policy reviewed by your own counsel
// before launching.
import Link from "next/link";

const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "this service";

export const metadata = {
  title: "Privacy Policy",
  description: `${projectName} privacy policy`,
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 font-bold text-4xl">
        {projectName} - Privacy Policy
      </h1>

      <p className="mb-6 text-muted-foreground">Effective Date: [DATE]</p>

      <p className="mb-6">
        This Privacy Policy describes how {projectName} (&quot;we&quot;,
        &quot;us&quot;) collects, uses, and shares information about you when
        you use our website and services (collectively, the
        &quot;Service&quot;). By using the Service, you agree to the practices
        described in this policy and in our{" "}
        <Link className="text-primary hover:underline" href="/terms-of-service">
          Terms of Service
        </Link>
        .
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Information We Collect
      </h2>

      <p className="mb-6">
        <strong>Account information.</strong> When you create an account, we
        collect your email address and, if you sign in with a third-party
        provider such as Google, basic profile information (such as your name
        and profile image) shared by that provider.
      </p>

      <p className="mb-6">
        <strong>Payment information.</strong> Payments are processed by our
        payment processor (Stripe). We do not store your full card details; we
        receive limited billing information such as your subscription status and
        plan.
      </p>

      <p className="mb-6">
        <strong>Usage information.</strong> We collect information about how you
        use the Service, such as pages visited, features used, and device and
        browser information, to operate and improve the Service.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        How We Use Information
      </h2>

      <p className="mb-6">
        We use the information we collect to provide and maintain the Service,
        authenticate you, process payments, send transactional emails (such as
        login codes and billing notices), respond to support requests, improve
        the Service, and comply with legal obligations. We do not sell your
        personal information.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Cookies</h2>

      <p className="mb-6">
        We use cookies that are necessary for the Service to function, such as
        session cookies for authentication and a preferences cookie that
        remembers choices you make (like your agreement to our terms and your
        preferred sign-in method). [Describe any analytics or advertising
        cookies you add, and any consent mechanism you use.]
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Third-Party Services</h2>

      <p className="mb-6">
        We share information with service providers that help us operate the
        Service, such as our hosting provider, payment processor (Stripe),
        authentication providers (such as Google), and email delivery provider.
        These providers process information on our behalf and are bound by their
        own privacy obligations. [List the providers you actually use.]
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Data Retention</h2>

      <p className="mb-6">
        We retain your information for as long as your account is active or as
        needed to provide the Service, comply with legal obligations, resolve
        disputes, and enforce our agreements. You may request deletion of your
        account and associated data at any time.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Your Rights</h2>

      <p className="mb-6">
        Depending on where you live, you may have rights to access, correct,
        export, or delete your personal information, or to object to or restrict
        certain processing. To exercise these rights, contact us at [CONTACT
        EMAIL]. We will respond within the timeframe required by applicable law.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Security</h2>

      <p className="mb-6">
        We take reasonable technical and organizational measures to protect your
        information. However, no method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Children&apos;s Privacy
      </h2>

      <p className="mb-6">
        The Service is not directed to children under 13 (or the equivalent
        minimum age in your jurisdiction), and we do not knowingly collect
        personal information from children.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">
        Changes to This Policy
      </h2>

      <p className="mb-6">
        We may update this Privacy Policy from time to time. If we make material
        changes, we will provide notice, such as by posting the updated policy
        on this page with a new effective date.
      </p>

      <h2 className="mt-8 mb-3 font-semibold text-2xl">Contact</h2>

      <p className="mb-6">
        Questions about this policy? Contact us at [CONTACT EMAIL].
      </p>
    </div>
  );
}
