import { useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { UserRound, Tent, Loader2, ShieldCheck } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { userApi } from '@/api/user';
import { hasCompleteIdentity } from '@/lib/identity';

/**
 * Modale bloquante affichée aux utilisateurs dont le compte n'a pas encore
 * de prénom / nom (comptes créés avant l'ajout de ces champs). Impossible
 * de la fermer sans enregistrer : ces informations sont requises pour
 * l'intégrité des données et l'affichage des noms dans les parties.
 */
export default function CompleteProfileModal() {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [campName, setCampName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const open = Boolean(user) && !hasCompleteIdentity(user);

  useEffect(() => {
    if (!open || !user) return;
    // Pré-remplit à partir du nom complet existant pour limiter la saisie.
    const parts = (user.name ?? '').trim().split(/\s+/);
    setFirstName(user.firstName ?? parts[0] ?? '');
    setLastName(user.lastName ?? parts.slice(1).join(' '));
    setCampName(user.campName ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return setError('Le prénom est requis.');
    if (!lastName.trim()) return setError('Le nom est requis.');
    setError('');
    setSaving(true);
    try {
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        campName: campName.trim() || undefined,
      });
      // La modale se ferme d'elle-même : l'identité devient complète au refresh.
      await auth?.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde. Réessaie.');
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Pas de fermeture au clic : la saisie est obligatoire. */}
          <div className="absolute inset-0 bg-camp-ink/50 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Complète ton profil"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="card-sign relative z-10 w-full max-w-md p-6 sm:p-7"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-camp-pine/10 text-camp-pine">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-black text-camp-pine-dark">
                Complète ton profil
              </h2>
            </div>

            <p className="mb-2 text-sm text-camp-ink">
              L’app affiche maintenant les joueurs par leur <strong>nom de camp</strong> (ou leur
              prénom) dans les parties. Pour que tout le monde te reconnaisse et que tes parties
              s’affichent correctement, ton prénom et ton nom sont désormais requis.
            </p>
            <p className="mb-5 text-xs text-camp-bark">
              Cette étape est obligatoire et ne te sera demandée qu’une seule fois.
            </p>

            <form onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cp-firstName" className="field-label flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-camp-pine" /> Prénom
                  </label>
                  <input
                    id="cp-firstName"
                    type="text"
                    autoComplete="given-name"
                    className="field"
                    placeholder="Ton prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label htmlFor="cp-lastName" className="field-label flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-camp-pine" /> Nom
                  </label>
                  <input
                    id="cp-lastName"
                    type="text"
                    autoComplete="family-name"
                    className="field"
                    placeholder="Ton nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="cp-campName" className="field-label flex items-center gap-2">
                  <Tent className="h-4 w-4 text-camp-pine" /> Nom de camp (optionnel)
                </label>
                <input
                  id="cp-campName"
                  type="text"
                  autoComplete="nickname"
                  className="field"
                  placeholder="Ex : Castor"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-camp-bark">
                  S’il est renseigné, c’est lui qui sera affiché dans les parties.
                </p>
              </div>

              {error && (
                <p role="alert" className="rounded-xl bg-camp-berry/10 px-3 py-2 text-sm font-semibold text-camp-berry">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer et continuer'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
