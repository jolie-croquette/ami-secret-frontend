import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/i18n/router';
import { motion } from 'motion/react';
import { AuthContext } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { Tag, CalendarDays, BellRing, Loader2, ArrowLeft } from 'lucide-react';
import { gamesApi } from '@/api/games';
import { Pennants } from '@/components/visuals/CampVisuals';
import 'react-toastify/dist/ReactToastify.css';

const clampInt = (v: string, min: number, fallback: number) => {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? fallback : Math.max(min, n);
};

export default function CreateGame() {
  const { t } = useTranslation('games', { keyPrefix: 'create' });
  const { user } = useContext(AuthContext) ?? ({} as never);
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [reminderDays, setReminderDays] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return toast.warning(t('nameRequired'));
    const adminName = String(user?.name || '').trim();
    if (!adminName) return toast.error(t('noName'));

    setSubmitting(true);
    try {
      const game = await gamesApi.create({
        name: cleanName,
        weeks: clampInt(String(weeks), 1, 1),
        reminderDays: clampInt(String(reminderDays), 0, 0),
        players: [adminName],
      });
      toast.success(t('created'));
      navigate(`/lobby/${game.code}/admin`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('error'));
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-camp-cream bg-topo px-4 py-12">
      <Pennants className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(680px,95vw)] h-12" />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card-sign mx-auto w-full max-w-xl p-8 sm:p-10"
        noValidate
      >
        <h1 className="mb-1 text-center font-display text-3xl font-black text-camp-pine-dark">
          {t('title')}
        </h1>
        <p className="label-hand mb-7 text-center text-2xl">{t('subtitle')}</p>

        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="field-label">{t('name')}</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
              <input
                id="name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                className="field pl-11"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="weeks" className="field-label">{t('weeks')}</label>
              <div className="relative">
                <CalendarDays className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                <input
                  id="weeks"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={weeks}
                  onChange={(e) => setWeeks(clampInt(e.target.value, 1, 1))}
                  className="field pl-11"
                  disabled={submitting}
                />
              </div>
            </div>
            <div>
              <label htmlFor="reminder" className="field-label">{t('reminder')}</label>
              <div className="relative">
                <BellRing className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-camp-bark/45" />
                <input
                  id="reminder"
                  type="number"
                  min={0}
                  max={6}
                  inputMode="numeric"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(clampInt(e.target.value, 0, 0))}
                  className="field pl-11"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-camp-bark">
            {t('hint')}
          </p>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost" disabled={submitting}>
            <ArrowLeft className="h-4 w-4" /> {t('back')}
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('submit')}
          </button>
        </div>
      </motion.form>

      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
