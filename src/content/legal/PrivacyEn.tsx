import { Link } from '@/i18n/router';
import { CONTACT_EMAIL, SITE_URL } from './constants';

const SITE_NAME = 'Secret Santa';

/** English version of the Privacy Policy (the French version prevails). */
export default function PrivacyEn() {
  return (
    <>
      <p>
        This Privacy Policy explains how {SITE_NAME} ({SITE_URL}) collects, uses, discloses and
        protects your personal information, in accordance with Québec’s{' '}
        <em>Act respecting the protection of personal information in the private sector</em> (as
        modernized by <em>Law 25</em>, formerly Bill 64) and Canada’s{' '}
        <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).
      </p>

      <section>
        <h2>1. Person in charge of personal information</h2>
        <p>The person in charge of protecting personal information is:</p>
        <ul>
          <li><strong>Name:</strong> Xavier Samson</li>
          <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a></li>
          <li><strong>Website:</strong> {SITE_URL}</li>
        </ul>
        <p>Any request about your personal information can be sent to the email address above.</p>
      </section>

      <section>
        <h2>2. Personal information we collect</h2>
        <p>We only collect the information needed for the purposes described below:</p>
        <ul>
          <li><strong>Identification:</strong> display name, email address, password (hashed, never readable).</li>
          <li><strong>Personal preferences:</strong> favorite color, favorite animal, likes, dislikes, allergies and wishlist — provided voluntarily during onboarding and visible to the members of your game.</li>
          <li><strong>Game data:</strong> games you create or join, gift-received status and anonymous messages exchanged.</li>
          <li><strong>Photos:</strong> gift photos you choose to upload, visible to the members of the game in question.</li>
          <li><strong>Technical data:</strong> IP address (handled by Vercel’s infrastructure), access logs and session cookies.</li>
          <li><strong>Notification subscriptions:</strong> Web Push encryption keys stored to send native push notifications (optional).</li>
        </ul>
      </section>

      <section>
        <h2>3. Why we collect it</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Create and manage your user account.</li>
          <li>Help you organize and take part in gift exchanges.</li>
          <li>Send transactional emails (game invitations, reminders, password resets).</li>
          <li>Send push notifications if you’ve agreed to receive them.</li>
          <li>Keep the service secure, detect abuse and improve the service.</li>
          <li>Analyze site usage in aggregate (through Vercel Analytics) to improve the user experience.</li>
        </ul>
        <p>We never sell or rent your personal information to third parties.</p>
      </section>

      <section>
        <h2>4. Sharing with third parties</h2>
        <p>
          Your information may be shared with the following service providers, only as far as
          needed to run the service:
        </p>
        <ul>
          <li><strong>Vercel Inc.</strong> (hosting, CDN, analytics) — United States.</li>
          <li><strong>MongoDB Atlas / MongoDB Inc.</strong> (database) — United States.</li>
          <li><strong>SMTP2Go</strong> (transactional email) — Australia / worldwide.</li>
          <li><strong>Cloudinary Ltd.</strong> (photo storage and delivery) — United States.</li>
        </ul>
        <p>
          These providers are bound by their own privacy policies, which comply with the GDPR or
          equivalent frameworks. Through agreements or privacy impact assessments, we make sure your
          information remains adequately protected when it is transferred outside Québec.
        </p>
      </section>

      <section>
        <h2>5. How long we keep it</h2>
        <ul>
          <li><strong>Active account:</strong> kept for as long as the account is active.</li>
          <li><strong>Inactive or deleted account:</strong> information is erased within a reasonable time after the account is deleted or a deletion request is made.</li>
          <li><strong>Photos:</strong> kept until the game or your account is deleted, or on request.</li>
          <li><strong>Technical logs:</strong> kept for up to 30 days by our hosting infrastructure.</li>
        </ul>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          We use a single functional cookie (<code>auth_token</code>) to keep you logged in. This
          cookie is <em>httpOnly</em>, <em>Secure</em> and <em>SameSite</em> — it can’t be read by
          JavaScript and is never used for advertising or commercial tracking.
        </p>
        <p>
          Vercel Analytics may collect aggregated, anonymized browsing data. No third-party
          advertising cookies are used.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p>Under Law 25, you have the following rights regarding your personal information:</p>
        <ul>
          <li><strong>Access:</strong> get a copy of the information we hold about you.</li>
          <li><strong>Correction:</strong> correct information that is inaccurate or incomplete.</li>
          <li><strong>Deletion:</strong> ask us to erase your information.</li>
          <li><strong>Portability:</strong> receive your information in a structured, commonly used technological format.</li>
          <li><strong>De-indexing:</strong> ask us to stop disseminating information about you online if it causes you harm.</li>
          <li><strong>Withdrawal of consent:</strong> withdraw your consent to the collection or use of your information at any time (for example, by turning off push notifications in your browser).</li>
        </ul>
        <p>
          To exercise any of these rights, use the{' '}
          <Link to="/profile" className="text-camp-pine underline">form in your profile</Link>{' '}
          (the “My privacy rights” section) or email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
          We’ll reply within 30 days.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We use reasonable, proportionate security measures to protect your information: TLS
          encryption for all communications, password hashing (bcrypt), request rate limiting,
          short-lived JWT tokens and data isolation between games.
        </p>
      </section>

      <section>
        <h2>9. Privacy incidents</h2>
        <p>
          If a privacy incident creates a risk of serious harm, we will notify Québec’s Commission
          d’accès à l’information (CAI) and the people affected within the time limits set by law.
        </p>
      </section>

      <section>
        <h2>10. Changes</h2>
        <p>
          We may update this policy at any time. The date of the latest update appears at the top of
          this page. If the changes are significant, we’ll let you know by email or with a banner in
          the app.
        </p>
      </section>

      <section>
        <h2>11. Contact and complaints</h2>
        <p>
          If you have any questions, contact the person in charge of personal information:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
        </p>
        <p>
          If you believe your rights have not been respected, you can file a complaint with the{' '}
          <strong>Commission d’accès à l’information du Québec (CAI)</strong>:{' '}
          <a
            href="https://www.cai.gouv.qc.ca"
            target="_blank"
            rel="noreferrer"
            className="text-camp-pine underline"
          >
            www.cai.gouv.qc.ca
          </a>.
        </p>
      </section>
    </>
  );
}
