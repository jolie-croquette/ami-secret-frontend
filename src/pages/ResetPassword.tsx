import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from '@/i18n/router';
import { useNavigate } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { Lock, Loader2, ShieldQuestion } from 'lucide-react';
import { authApi } from '@/api/auth';
import { ApiError } from '@/api/client';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.warning(t('toasts.passwordTooShort'));
    if (password !== confirm) return toast.warning(t('reset.mismatch'));

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success(t('reset.success'));
      setTimeout(() => navigate('/', { replace: true }), 900);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error(t('reset.invalidLink'));
      } else {
        toast.error(err instanceof Error ? err.message : t('errors.generic', { ns: 'common' }));
      }
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
        {!token ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-camp-berry/15 text-camp-berry">
              <ShieldQuestion className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">{t('reset.missingTitle')}</h1>
            <p className="mt-2 text-sm text-camp-bark">
              {t('reset.missingBody')}
            </p>
            <Link to="/forgot-password" className="btn-primary mt-6 inline-flex">
              {t('reset.requestLink')}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">
              {t('reset.title')}
            </h1>
            <p className="mt-1 mb-6 text-sm text-camp-bark">{t('reset.intro')}</p>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="password" className="field-label">
                  {t('fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="field pl-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="field-label">
                  {t('fields.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    className="field pl-11"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('reset.submit')}
              </button>
            </form>
          </>
        )}
      </motion.div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
