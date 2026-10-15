import { Link } from '@/i18n/router';
import { CONTACT_EMAIL, SITE_URL } from './constants';

const SITE_NAME = 'Secret Santa';

/** English version of the Terms of Use (the French version prevails). */
export default function TermsEn() {
  return (
    <>
      <p>
        By accessing or using {SITE_NAME} ({SITE_URL}), you agree to these Terms of Use in full. If
        you do not agree, please stop using the service.
      </p>

      <section>
        <h2>1. The service</h2>
        <p>
          {SITE_NAME} is a web app that lets groups of people organize gift exchanges (also known as
          “Secret Santa”). The service lets you create games, manage players, send anonymous
          messages, share photos and receive notifications.
        </p>
        <p>
          The service is provided by Xavier Samson (Splash), as an individual, from Québec, Canada.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>Anyone may use the service. By creating an account, you confirm that you:</p>
        <ul>
          <li>Are at least 13 years old (or the minimum age required by law where you live).</li>
          <li>Provide accurate information when you sign up.</li>
          <li>Are responsible for keeping your password confidential and for any access to your account.</li>
        </ul>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <p>
          You agree to use {SITE_NAME} only for lawful purposes and in line with these terms. In
          particular, you may not:
        </p>
        <ul>
          <li>Upload content that is illegal, offensive, hateful, defamatory, sexually explicit or that infringes the rights of others.</li>
          <li>Impersonate another person.</li>
          <li>Attempt to bypass security measures or access other people’s accounts.</li>
          <li>Use the service for commercial or marketing purposes without written permission.</li>
          <li>Carry out denial-of-service attacks or any action that harms the availability of the service.</li>
          <li>Automatically extract, collect or scrape data from the service.</li>
          <li>Share content that infringes copyrights, trademarks or any other intellectual property rights.</li>
        </ul>
      </section>

      <section>
        <h2>4. Content you share</h2>
        <p>
          By sharing content on {SITE_NAME} (messages, photos, preferences), you confirm that you hold
          all the necessary rights to it, and you grant {SITE_NAME} a limited, non-exclusive,
          royalty-free license to store it and show it to the members of your game, solely to
          provide the service.
        </p>
        <p>
          You remain solely responsible for the content you share. {SITE_NAME} may remove any content
          that breaches these terms without notice.
        </p>
      </section>

      <section>
        <h2>5. Accounts and termination</h2>
        <p>
          You can close your account at any time by contacting us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
          Closing your account deletes your personal information within the time frames set out in
          our{' '}
          <Link to="/privacy" className="text-camp-pine underline">
            Privacy Policy
          </Link>.
        </p>
        <p>
          We may suspend or close any account that breaches these terms, without notice or
          compensation.
        </p>
      </section>

      <section>
        <h2>6. Availability and changes to the service</h2>
        <p>
          {SITE_NAME} is provided “as is” and “as available”. We do not guarantee uninterrupted
          availability, and we may change, suspend or discontinue all or part of the service at any
          time, with or without notice.
        </p>
        <p>
          We may update these terms at any time. By continuing to use the service after changes are
          posted, you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>7. Limitation of liability</h2>
        <p>
          To the extent permitted by Québec law, {SITE_NAME} is not liable for any indirect,
          incidental, special or consequential damages arising from the use of, or inability to use,
          the service.
        </p>
        <p>
          {SITE_NAME} is not responsible for content shared by users or for anything players do as
          part of a game.
        </p>
      </section>

      <section>
        <h2>8. Intellectual property</h2>
        <p>
          The name, logo, design and source code of {SITE_NAME} are the property of Xavier Samson.
          Any reproduction or use without written permission is prohibited.
        </p>
      </section>

      <section>
        <h2>9. Governing law and jurisdiction</h2>
        <p>
          These terms are governed by the laws of the Province of Québec and the federal laws of
          Canada that apply there. Any dispute falls under the exclusive jurisdiction of the courts
          of Québec.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          If you have any questions about these terms:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>
        </p>
      </section>
    </>
  );
}
