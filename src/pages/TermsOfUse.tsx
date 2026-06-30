import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';

const LAST_UPDATED = '30 juin 2026';
const CONTACT_EMAIL = 'no-reply@amisecret.xyz';
const SITE_NAME = 'Ami Secret';
const SITE_URL = 'https://amisecret.xyz';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-camp-pine hover:text-camp-pine-dark"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <div className="card-sign p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-camp-ember/15 text-camp-ember">
              <ScrollText className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-black text-camp-pine-dark">
                Conditions d'utilisation
              </h1>
              <p className="text-xs text-camp-bark/70">Dernière mise à jour : {LAST_UPDATED}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-camp-ink [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-camp-pine-dark [&_li]:mb-1 [&_li]:ml-4 [&_p]:leading-relaxed [&_ul]:list-disc">

            <p>
              En accédant à {SITE_NAME} ({SITE_URL}) ou en l'utilisant, vous acceptez les présentes
              conditions d'utilisation dans leur intégralité. Si vous n'êtes pas d'accord, veuillez
              cesser d'utiliser le service.
            </p>

            <section>
              <h2>1. Description du service</h2>
              <p>
                {SITE_NAME} est une application web permettant à des groupes de personnes d'organiser
                des échanges de cadeaux (type « ami secret »). Le service inclut la création de parties,
                la gestion des participants, l'envoi de messages anonymes, le partage de photos et
                l'envoi de notifications.
              </p>
              <p>
                Le service est fourni par Xavier Samson (Splash), à titre personnel, depuis le Québec,
                Canada.
              </p>
            </section>

            <section>
              <h2>2. Admissibilité</h2>
              <p>
                L'utilisation du service est ouverte à toute personne physique. En créant un compte,
                vous déclarez :
              </p>
              <ul>
                <li>Avoir au moins 13 ans (ou l'âge minimum requis par la loi dans votre territoire).</li>
                <li>Fournir des informations exactes lors de votre inscription.</li>
                <li>Être responsable de la confidentialité de votre mot de passe et de l'accès à votre compte.</li>
              </ul>
            </section>

            <section>
              <h2>3. Utilisation acceptable</h2>
              <p>Vous vous engagez à utiliser {SITE_NAME} uniquement à des fins légales et conformément aux présentes conditions. Il est notamment interdit de :</p>
              <ul>
                <li>Téléverser des contenus illégaux, offensants, haineux, diffamatoires, à caractère sexuel explicite, ou portant atteinte aux droits d'autrui.</li>
                <li>Usurper l'identité d'une autre personne.</li>
                <li>Tenter de contourner les mesures de sécurité ou d'accéder à des comptes tiers.</li>
                <li>Utiliser le service à des fins commerciales ou de démarchage sans autorisation écrite.</li>
                <li>Effectuer des attaques par déni de service ou toute action nuisant à la disponibilité du service.</li>
                <li>Extraire, collecter ou scraper automatiquement les données du service.</li>
                <li>Partager du contenu qui viole des droits d'auteur, des marques de commerce ou tout autre droit de propriété intellectuelle.</li>
              </ul>
            </section>

            <section>
              <h2>4. Contenu partagé par les utilisateurs</h2>
              <p>
                En partageant du contenu sur {SITE_NAME} (messages, photos, préférences), vous déclarez
                détenir tous les droits nécessaires sur ce contenu et accorder à {SITE_NAME} une licence
                limitée, non exclusive et gratuite pour le stocker et le diffuser aux membres de votre
                partie, dans le seul but de fournir le service.
              </p>
              <p>
                Vous restez seul(e) responsable du contenu que vous partagez. {SITE_NAME} se réserve le
                droit de supprimer tout contenu contraire aux présentes conditions sans préavis.
              </p>
            </section>

            <section>
              <h2>5. Comptes et résiliation</h2>
              <p>
                Vous pouvez fermer votre compte à tout moment en nous contactant à{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
                La fermeture entraîne la suppression de vos données personnelles dans les délais indiqués
                dans notre{' '}
                <Link to="/privacy" className="text-camp-pine underline">
                  politique de confidentialité
                </Link>.
              </p>
              <p>
                Nous nous réservons le droit de suspendre ou de fermer un compte qui contrevient aux
                présentes conditions, sans préavis ni indemnité.
              </p>
            </section>

            <section>
              <h2>6. Disponibilité et modifications du service</h2>
              <p>
                {SITE_NAME} est fourni « tel quel » et « selon disponibilité ». Nous ne garantissons pas
                une disponibilité ininterrompue et pouvons modifier, suspendre ou interrompre tout ou
                partie du service à tout moment, avec ou sans préavis.
              </p>
              <p>
                Nous pouvons modifier les présentes conditions à tout moment. La poursuite de l'utilisation
                du service après publication des modifications vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2>7. Limitation de responsabilité</h2>
              <p>
                Dans les limites permises par la loi québécoise, {SITE_NAME} ne pourra être tenu
                responsable des dommages indirects, accessoires, spéciaux ou consécutifs découlant de
                l'utilisation ou de l'impossibilité d'utiliser le service.
              </p>
              <p>
                {SITE_NAME} n'est pas responsable des contenus partagés par les utilisateurs ni des
                actions posées par les participants dans le cadre d'une partie.
              </p>
            </section>

            <section>
              <h2>8. Propriété intellectuelle</h2>
              <p>
                Le nom, le logo, le design et le code source de {SITE_NAME} sont la propriété de Xavier
                Samson. Toute reproduction ou utilisation sans autorisation écrite est interdite.
              </p>
            </section>

            <section>
              <h2>9. Droit applicable et juridiction</h2>
              <p>
                Les présentes conditions sont régies par les lois de la province de Québec et les lois
                fédérales du Canada qui s'y appliquent. Tout litige sera soumis à la compétence exclusive
                des tribunaux du Québec.
              </p>
            </section>

            <section>
              <h2>10. Contact</h2>
              <p>
                Pour toute question relative aux présentes conditions :{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
