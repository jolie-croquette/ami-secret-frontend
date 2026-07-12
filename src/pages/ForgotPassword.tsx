import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { Mail, Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { authApi } from '@/api/auth';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(email)) return toast.warning('Adresse courriel invalide.');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-camp-cream bg-topo px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card-sign w-full max-w-md p-8 sm:p-10"
      >
        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-camp-sand text-camp-pine">
              <MailCheck className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">Vérifiez vos courriels</h1>
            <p className="mt-2 text-sm text-camp-bark">
              Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.
              Le lien expire dans 1 heure.
            </p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">Mot de passe oublié</h1>
            <p className="mt-1 mb-6 text-sm text-camp-bark">
              Entrez votre courriel : nous vous enverrons un lien pour choisir un nouveau mot de passe.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="field-label">
                  Courriel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="field pl-11"
                    placeholder="exemple@courriel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Envoyer le lien'}
              </button>
            </form>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-camp-pine hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          </>
        )}
      </motion.div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
