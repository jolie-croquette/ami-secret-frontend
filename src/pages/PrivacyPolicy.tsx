import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const LAST_UPDATED = '30 juin 2026';
const CONTACT_EMAIL = 'no-reply@amisecret.xyz';
const SITE_NAME = 'Ami Secret';
const SITE_URL = 'https://amisecret.xyz';

export default function PrivacyPolicy() {
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
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-camp-pine/15 text-camp-pine">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-black text-camp-pine-dark">
                Politique de confidentialité
              </h1>
              <p className="text-xs text-camp-bark/70">Dernière mise à jour : {LAST_UPDATED}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-camp-ink [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-camp-pine-dark [&_li]:mb-1 [&_li]:ml-4 [&_p]:leading-relaxed [&_ul]:list-disc">

            <p>
              La présente politique de confidentialité explique comment {SITE_NAME} ({SITE_URL})
              collecte, utilise, divulgue et protège vos renseignements personnels, conformément à la
              <em> Loi sur la protection des renseignements personnels dans le secteur privé</em> (LPRPSP,
              Loi 25), telle que modernisée par la <em>Loi 64</em>, ainsi qu'à la <em>Loi sur la
              protection des renseignements personnels et les documents électroniques</em> (LPRPDE) du
              Canada.
            </p>

            <section>
              <h2>1. Responsable de la protection des renseignements personnels</h2>
              <p>
                Le responsable de la protection des renseignements personnels (RPRP) est :
              </p>
              <ul>
                <li><strong>Nom :</strong> Xavier Samson</li>
                <li><strong>Courriel :</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a></li>
                <li><strong>Site :</strong> {SITE_URL}</li>
              </ul>
              <p>
                Toute demande relative à vos renseignements personnels peut être adressée au RPRP à
                l'adresse courriel ci-dessus.
              </p>
            </section>

            <section>
              <h2>2. Renseignements personnels collectés</h2>
              <p>Nous collectons uniquement les renseignements nécessaires aux fins décrites ci-dessous :</p>
              <ul>
                <li><strong>Identification :</strong> nom d'affichage, adresse courriel, mot de passe (haché, non lisible).</li>
                <li><strong>Préférences personnelles :</strong> couleur préférée, animal préféré, goûts, aversions, allergies, liste de souhaits — fournis volontairement lors de l'intégration et visibles par les membres de votre partie.</li>
                <li><strong>Données de jeu :</strong> parties créées ou rejointes, statut de réception des cadeaux, messages anonymes échangés.</li>
                <li><strong>Photos :</strong> photos de réception de cadeaux téléversées volontairement, visibles par les membres de la partie concernée.</li>
                <li><strong>Données techniques :</strong> adresse IP (gérée par l'infrastructure Vercel), journaux d'accès, témoins (cookies) de session.</li>
                <li><strong>Abonnements aux notifications :</strong> clés de chiffrement Web Push stockées pour l'envoi de notifications push natives (optionnel).</li>
              </ul>
            </section>

            <section>
              <h2>3. Finalités de la collecte</h2>
              <p>Vos renseignements sont utilisés pour :</p>
              <ul>
                <li>Créer et gérer votre compte utilisateur.</li>
                <li>Faciliter l'organisation et la participation aux échanges de cadeaux.</li>
                <li>Transmettre des communications transactionnelles (invitation à une partie, rappels, réinitialisation de mot de passe).</li>
                <li>Envoyer des notifications push si vous y avez consenti.</li>
                <li>Assurer la sécurité, détecter les abus et améliorer le service.</li>
                <li>Analyser l'utilisation du site de manière agrégée (via Vercel Analytics) afin d'améliorer l'expérience utilisateur.</li>
              </ul>
              <p>Nous ne vendons ni ne louons vos renseignements personnels à des tiers.</p>
            </section>

            <section>
              <h2>4. Communication à des tiers</h2>
              <p>
                Vos renseignements peuvent être transmis aux sous-traitants suivants, uniquement dans la
                mesure nécessaire à la prestation du service :
              </p>
              <ul>
                <li><strong>Vercel Inc.</strong> (hébergement, CDN, analytics) — États-Unis.</li>
                <li><strong>MongoDB Atlas / MongoDB Inc.</strong> (base de données) — États-Unis.</li>
                <li><strong>SMTP2Go</strong> (envoi de courriels transactionnels) — Australie / mondial.</li>
                <li><strong>Cloudinary Ltd.</strong> (stockage et diffusion des photos) — États-Unis.</li>
              </ul>
              <p>
                Ces sous-traitants sont liés par leurs propres politiques de confidentialité conformes au
                RGPD ou à des cadres équivalents. Nous nous assurons, par convention ou par évaluation
                des facteurs relatifs à la vie privée (EFVP), que les renseignements bénéficient d'une
                protection adéquate lors de leur communication à l'extérieur du Québec.
              </p>
            </section>

            <section>
              <h2>5. Durée de conservation</h2>
              <ul>
                <li><strong>Compte actif :</strong> conservé tant que le compte est actif.</li>
                <li><strong>Compte inactif ou supprimé :</strong> les renseignements sont effacés dans un délai raisonnable suivant la suppression du compte ou une demande de suppression.</li>
                <li><strong>Photos :</strong> conservées jusqu'à suppression de la partie ou de votre compte, ou sur demande.</li>
                <li><strong>Journaux techniques :</strong> conservés 30 jours maximum par l'infrastructure d'hébergement.</li>
              </ul>
            </section>

            <section>
              <h2>6. Témoins (cookies)</h2>
              <p>
                Nous utilisons un seul témoin fonctionnel (<code>auth_token</code>) pour maintenir votre
                session. Ce témoin est <em>httpOnly</em>, <em>Secure</em> et <em>SameSite</em> — il n'est
                pas accessible par JavaScript et ne sert pas à des fins publicitaires ou de pistage
                commercial.
              </p>
              <p>
                Vercel Analytics peut collecter des données de navigation agrégées et anonymisées.
                Aucun témoin de tierces parties à vocation publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2>7. Vos droits</h2>
              <p>
                Conformément à la Loi 25, vous disposez des droits suivants à l'égard de vos
                renseignements personnels :
              </p>
              <ul>
                <li><strong>Accès :</strong> obtenir une copie des renseignements que nous détenons sur vous.</li>
                <li><strong>Rectification :</strong> corriger des renseignements inexacts ou incomplets.</li>
                <li><strong>Suppression :</strong> demander l'effacement de vos renseignements.</li>
                <li><strong>Portabilité :</strong> recevoir vos renseignements dans un format technologique structuré et couramment utilisé.</li>
                <li><strong>Déindexation :</strong> demander la cessation de la diffusion de renseignements vous concernant sur Internet si leur diffusion vous cause préjudice.</li>
                <li><strong>Retrait du consentement :</strong> retirer à tout moment votre consentement à la collecte ou à l'utilisation de vos renseignements (ex. : désactiver les notifications push depuis votre navigateur).</li>
              </ul>
              <p>
                Pour exercer l'un de ces droits, écrivez au RPRP à l'adresse{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
                Nous répondrons dans un délai de 30 jours.
              </p>
            </section>

            <section>
              <h2>8. Sécurité</h2>
              <p>
                Nous appliquons des mesures de sécurité raisonnables et proportionnées pour protéger vos
                renseignements : chiffrement TLS pour toutes les communications, hachage des mots de passe
                (bcrypt), limitation du débit des requêtes, jetons JWT à courte durée de vie, et
                cloisonnement des données par partie.
              </p>
            </section>

            <section>
              <h2>9. Incidents de confidentialité</h2>
              <p>
                En cas d'incident de confidentialité présentant un risque sérieux de préjudice, nous en
                informerons la Commission d'accès à l'information (CAI) du Québec et les personnes
                concernées dans les délais prévus par la loi.
              </p>
            </section>

            <section>
              <h2>10. Modifications</h2>
              <p>
                Nous pouvons modifier la présente politique à tout moment. La date de la dernière mise à
                jour est indiquée en haut de cette page. Si les modifications sont importantes, nous vous
                en informerons par courriel ou par une bannière dans l'application.
              </p>
            </section>

            <section>
              <h2>11. Contact et plaintes</h2>
              <p>
                Pour toute question, contactez notre RPRP :{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-camp-pine underline">{CONTACT_EMAIL}</a>.
              </p>
              <p>
                Si vous estimez que vos droits n'ont pas été respectés, vous pouvez déposer une plainte
                auprès de la{' '}
                <strong>Commission d'accès à l'information du Québec (CAI)</strong> :{' '}
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
          </div>
        </div>
      </div>
    </div>
  );
}
