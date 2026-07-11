import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Tent } from 'lucide-react';
import { ApiError } from '@/api/client';
import { Pennants, MeritBadge, PineTree, CampScene } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

export default function AuthPage() {
  // `/login?mode=signup` ouvre directement l'onglet Inscription (CTA de l'accueil).
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const emptyForm = { firstName: '', lastName: '', campName: '', email: '', password: '' };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const switchMode = (login: boolean) => {
    if (isSubmitting || login === isLogin) return;
    setIsLogin(login);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return toast.error('Erreur interne : contexte d’authentification indisponible');

    const { firstName, lastName, campName, email, password } = form;
    if (!email || !password) return toast.warning('Courriel et mot de passe sont requis.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    if (!emailRegex.test(email)) return toast.warning('Adresse courriel invalide.');
    if (!isLogin && !firstName.trim()) return toast.warning('Le prénom est requis.');
    if (!isLogin && !lastName.trim()) return toast.warning('Le nom est requis.');
    if (password.length < 6) return toast.warning('Mot de passe trop court (min. 6 caractères).');

    setIsSubmitting(true);
    try {
      if (!isLogin) {
        await auth.signup({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          campName: campName.trim() || undefined,
          email,
          password,
        });
        toast.success('Compte créé.');
        navigate('/onboard', { replace: true });
      } else {
        await auth.login(email, password);
        toast.success('Connexion réussie.');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('Ce courriel est déjà utilisé.');
      } else if (err instanceof ApiError && err.status === 401) {
        toast.error('Courriel ou mot de passe incorrect.');
      } else {
        toast.error(err instanceof Error ? err.message : 'Erreur d’authentification.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-camp-cream bg-topo flex items-center justify-center px-4 py-16">
      <Pennants className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(680px,95vw)] h-12" />

      <PineTree className="hidden md:block absolute bottom-24 left-10 w-20 opacity-80 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-32 left-28 w-12 opacity-70 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-24 right-10 w-24 opacity-80 animate-sway" />
      <PineTree className="hidden md:block absolute bottom-36 right-32 w-14 opacity-70 animate-sway" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-sign relative z-10 w-full max-w-md p-8 sm:p-10"
      >
        <div className="flex flex-col items-center -mt-20 mb-4">
          <MeritBadge
            label="AS"
            tone="#2f5d50"
            className="w-28 h-28 drop-shadow-md animate-stamp-in"
            title="Insigne Ami Secret"
          />
          <p className="label-hand text-2xl mt-1 -rotate-2">l’échange de cadeaux entre amis</p>
        </div>

        {/* Sélecteur connexion / inscription */}
        <div className="relative grid grid-cols-2 gap-1 rounded-full bg-camp-sand/80 p-1 mb-7">
          {[
            { login: true, label: 'Connexion' },
            { login: false, label: 'Inscription' },
          ].map(({ login, label }) => {
            const active = login === isLogin;
            return (
              <button
                key={label}
                type="button"
                onClick={() => switchMode(login)}
                className="relative z-10 rounded-full py-2 text-sm font-extrabold"
                disabled={isSubmitting}
              >
                {active && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-camp-pine shadow-sign-sm"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className={active ? 'text-camp-cream' : 'text-camp-pine'}>{label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="field-label">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-camp-bark/45" />
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        className="field pl-11"
                        placeholder="Ton prénom"
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="field-label">Nom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-camp-bark/45" />
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        className="field pl-11"
                        placeholder="Ton nom"
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="campName" className="field-label">Nom de camp (optionnel)</label>
                  <div className="relative">
                    <Tent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-camp-bark/45" />
                    <input
                      id="campName"
                      type="text"
                      autoComplete="nickname"
                      className="field pl-11"
                      placeholder="Ex : Castor"
                      value={form.campName}
                      onChange={(e) => setForm({ ...form, campName: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="mt-1 text-xs text-camp-bark/70">
                    S’il est renseigné, c’est lui qui sera affiché dans les parties.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="email" className="field-label">Courriel</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-camp-bark/45" />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="field pl-11"
                placeholder="exemple@courriel.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="field-label">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-camp-bark/45" />
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="field pl-11"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-lg !mt-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isLogin ? 'Connexion…' : 'Création…'}
              </>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </button>

          {isLogin && (
            <p className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-camp-pine hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </p>
          )}
        </form>
      </motion.div>

      <CampScene className="absolute bottom-0 left-0 w-full h-32 pointer-events-none" />

      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
