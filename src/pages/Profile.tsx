import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/i18n/router';
import { formatDate } from '@/i18n/format';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { X, Heart, HeartCrack, ShieldAlert, Palette, PawPrint, Loader2, Mail, Gift, ShieldCheck, ChevronDown, Bell, BellOff, BellRing, UserRound, Tent } from 'lucide-react';
import { userApi } from '@/api/user';
import type { WishlistItem } from '@/api/types';
import WishlistEditor from '@/components/WishlistEditor';
import { MeritBadge } from '@/components/visuals/CampVisuals';
import {
  privacyRequestApi,
  TYPE_LABELS,
  type PrivacyRequestType,
  type PrivacyRequestStatus,
  type PrivacyRequest,
} from '@/api/privacyRequest';
import { pushApi } from '@/api/push';
import { urlBase64ToUint8Array } from '@/lib/push';
import 'react-toastify/dist/ReactToastify.css';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-camp-sand text-camp-bark',
  in_progress: 'bg-camp-sun/30 text-camp-pine-dark',
  resolved: 'bg-camp-pine/15 text-camp-pine-dark',
  rejected: 'bg-camp-berry/15 text-camp-berry',
};

function StatusBadge({ status }: { status: PrivacyRequestStatus }) {
  const { t } = useTranslation('profile');
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? ''}`}>
      {t(`privacy.statuses.${status}`, { defaultValue: status })}
    </span>
  );
}

const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('') || 'AS';

function TagInput({
  label,
  icon: Icon,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof Heart;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation('profile');
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim().replace(/\s+/g, ' ');
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft('');
    onChange([...values, v]);
    setDraft('');
  };

  return (
    <div>
      <label className="field-label flex items-center gap-2">
        <Icon className="h-4 w-4 text-camp-pine" /> {label}
      </label>
      <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-camp-bark/25 bg-white/70 p-2 focus-within:ring-4 focus-within:ring-camp-sun/40">
        {values.map((value, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-camp-sand px-3 py-1 text-sm font-semibold text-camp-pine-dark">
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label={t('prefs.removeTag', { value })}
              className="text-camp-berry"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(draft)}
          placeholder={placeholder}
          className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

function NotificationSection() {
  const { t } = useTranslation('profile', { keyPrefix: 'notifications' });
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<PushPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const refreshState = async () => {
    if (!supported) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermission);
    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      } catch {
        setSubscribed(false);
      }
    } else {
      setSubscribed(false);
    }
  };

  useEffect(() => {
    if (open) void refreshState();
  }, [open]);

  const subscribe = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setPermission(perm as PushPermission);
        return;
      }
      const { publicKey } = await pushApi.getPublicKey();
      if (!publicKey) throw new Error(t('missingKey'));
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const raw = sub.toJSON();
      await pushApi.subscribe({
        endpoint: sub.endpoint,
        keys: { p256dh: raw.keys!.p256dh, auth: raw.keys!.auth },
      });
      await refreshState();
      toast.success(t('enabled'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('enableError'));
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      await refreshState();
      toast.success(t('disabled'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('disableError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-sign mt-4">
      <button
        type="button"
        className="flex w-full items-center justify-between p-6"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-camp-pine" />
          <span className="font-display text-lg font-bold text-camp-pine-dark">{t('title')}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-camp-bark transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-camp-bark/10 px-6 pb-6 pt-4">
          {permission === 'unsupported' && (
            <div className="flex items-start gap-3 rounded-xl bg-camp-sand/60 p-4 text-sm text-camp-bark">
              <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-camp-bark/60" />
              <p>{t('unsupported')}</p>
            </div>
          )}

          {permission === 'denied' && (
            <div className="flex items-start gap-3 rounded-xl bg-camp-berry/10 p-4 text-sm text-camp-berry">
              <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">{t('blockedTitle')}</p>
                <p className="mt-1 text-camp-berry/80">
                  {t('blockedBody')}
                </p>
              </div>
            </div>
          )}

          {(permission === 'default' || permission === 'granted') && (
            <>
              <div className="flex items-center justify-between rounded-xl bg-camp-sand/40 p-4">
                <div className="flex items-center gap-3">
                  {subscribed ? (
                    <BellRing className="h-5 w-5 text-camp-pine" />
                  ) : (
                    <BellOff className="h-5 w-5 text-camp-bark/50" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-camp-pine-dark">
                      {subscribed ? t('onTitle') : t('offTitle')}
                    </p>
                    <p className="text-xs text-camp-bark/60">
                      {subscribed ? t('onBody') : t('offBody')}
                    </p>
                  </div>
                </div>
                <span className={`h-3 w-3 rounded-full ${subscribed ? 'bg-camp-pine' : 'bg-camp-bark/30'}`} />
              </div>

              {subscribed ? (
                <button
                  type="button"
                  onClick={() => void unsubscribe()}
                  disabled={busy}
                  className="btn-ghost w-full justify-center"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                  {t('disable')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void subscribe()}
                  disabled={busy}
                  className="btn-primary w-full justify-center"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  {t('enable')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlayerProfilePage() {
  const { t } = useTranslation('profile');
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [campName, setCampName] = useState('');
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<PrivacyRequest[]>([]);
  const [privacyType, setPrivacyType] = useState<PrivacyRequestType>('access');
  const [privacyMessage, setPrivacyMessage] = useState('');
  const [sendingPrivacy, setSendingPrivacy] = useState(false);

  useEffect(() => {
    // Repli sur le nom complet pour les comptes créés avant l'ajout des champs.
    const parts = (user?.name ?? '').trim().split(/\s+/);
    setFirstName(user?.firstName ?? parts[0] ?? '');
    setLastName(user?.lastName ?? parts.slice(1).join(' '));
    setCampName(user?.campName ?? '');
  }, [user?.firstName, user?.lastName, user?.campName, user?.name]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      try {
        const data = await userApi.preferences(user.id);
        if (!active) return;
        setLikes(data.likes ?? []);
        setDislikes(data.dislikes ?? []);
        setAllergies(data.allergies ?? []);
        setColor(data.favoriteColor ?? '');
        setAnimal(data.favoriteAnimal ?? '');
        setWishlist(data.wishlist ?? []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('errors.load'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  const loadMyRequests = async () => {
    try {
      const data = await privacyRequestApi.mine();
      setMyRequests(data);
    } catch {
      // silencieux
    }
  };

  const submitPrivacyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingPrivacy(true);
    try {
      await privacyRequestApi.create({ type: privacyType, message: privacyMessage.trim() || undefined });
      toast.success(t('privacy.submitted'));
      setPrivacyMessage('');
      await loadMyRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('privacy.submitError'));
    } finally {
      setSendingPrivacy(false);
    }
  };

  const saveIdentity = async () => {
    if (!firstName.trim()) return toast.warning(t('identity.firstNameRequired'));
    if (!lastName.trim()) return toast.warning(t('identity.lastNameRequired'));
    setSavingIdentity(true);
    try {
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        campName: campName.trim() || undefined,
      });
      await auth?.refresh();
      toast.success(t('identity.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.save'));
    } finally {
      setSavingIdentity(false);
    }
  };

  const save = async () => {
    if (likes.length === 0) return toast.warning(t('prefs.likesRequired'));
    if (!color.trim() || !animal.trim()) return toast.warning(t('prefs.colorAnimalRequired'));
    setSaving(true);
    try {
      await userApi.onboard({
        likes,
        dislikes,
        allergies,
        color: color.trim(),
        animal: animal.trim(),
        wishlist: wishlist
          .map((w) => ({ title: w.title.trim(), url: w.url?.trim() || undefined, price: w.price?.trim() || undefined }))
          .filter((w) => w.title),
      });
      await auth?.refresh();
      toast.success(t('prefs.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-camp-cream bg-topo px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-sign mb-6 flex items-center gap-4 p-6"
        >
          <MeritBadge label={initials(user?.name)} className="h-16 w-16" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-camp-pine-dark">{user?.name}</h1>
            <p className="flex items-center gap-1.5 truncate text-sm text-camp-bark">
              <Mail className="h-4 w-4" /> {user?.email}
            </p>
          </div>
        </motion.div>

        <div className="card-sign mb-6 space-y-5 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-camp-pine-dark">{t('identity.title')}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label flex items-center gap-2">
                <UserRound className="h-4 w-4 text-camp-pine" /> {t('identity.firstName')}
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('identity.firstNamePlaceholder')}
                className="field"
              />
            </div>
            <div>
              <label className="field-label flex items-center gap-2">
                <UserRound className="h-4 w-4 text-camp-pine" /> {t('identity.lastName')}
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('identity.lastNamePlaceholder')}
                className="field"
              />
            </div>
          </div>
          <div>
            <label className="field-label flex items-center gap-2">
              <Tent className="h-4 w-4 text-camp-pine" /> {t('identity.campName')}
            </label>
            <input
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              placeholder={t('identity.campNamePlaceholder')}
              className="field"
            />
            <p className="mt-1 text-xs text-camp-bark">
              {t('identity.campNameHint')}
            </p>
          </div>
          <button onClick={() => void saveIdentity()} disabled={savingIdentity} className="btn-primary">
            {savingIdentity ? <Loader2 className="h-5 w-5 animate-spin" /> : t('identity.save')}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-camp-pine" />
          </div>
        ) : (
          <div className="card-sign space-y-5 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-camp-pine-dark">{t('prefs.title')}</h2>
            <TagInput label={t('fields.likes')} icon={Heart} values={likes} onChange={setLikes} placeholder={t('prefs.likesPlaceholder')} />
            <TagInput label={t('fields.dislikes')} icon={HeartCrack} values={dislikes} onChange={setDislikes} placeholder={t('prefs.dislikesPlaceholder')} />
            <TagInput label={t('fields.allergies')} icon={ShieldAlert} values={allergies} onChange={setAllergies} placeholder={t('prefs.allergiesPlaceholder')} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label flex items-center gap-2">
                  <Palette className="h-4 w-4 text-camp-pine" /> {t('fields.color')}
                </label>
                <input value={color} onChange={(e) => setColor(e.target.value)} placeholder={t('prefs.colorPlaceholder')} className="field" />
              </div>
              <div>
                <label className="field-label flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-camp-pine" /> {t('fields.animal')}
                </label>
                <input value={animal} onChange={(e) => setAnimal(e.target.value)} placeholder={t('prefs.animalPlaceholder')} className="field" />
              </div>
            </div>

            <div>
              <label className="field-label flex items-center gap-2">
                <Gift className="h-4 w-4 text-camp-pine" /> {t('fields.wishlist')}
              </label>
              <p className="mb-2 text-xs text-camp-bark">
                {t('prefs.wishlistHint')}
              </p>
              <WishlistEditor items={wishlist} onChange={setWishlist} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : t('prefs.save')}
              </button>
              <button onClick={() => navigate('/dashboard')} disabled={saving} className="btn-ghost">
                {t('prefs.back')}
              </button>
            </div>
          </div>
        )}

        {/* Section notifications */}
        <NotificationSection />

        {/* Section vie privée */}
        <div className="card-sign mt-4">
          <button
            type="button"
            className="flex w-full items-center justify-between p-6"
            onClick={() => {
              setPrivacyOpen((o) => !o);
              if (!privacyOpen) void loadMyRequests();
            }}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-camp-pine" />
              <span className="font-display text-lg font-bold text-camp-pine-dark">{t('privacy.title')}</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-camp-bark transition-transform ${privacyOpen ? 'rotate-180' : ''}`} />
          </button>

          {privacyOpen && (
            <div className="space-y-5 border-t border-camp-bark/10 px-6 pb-6 pt-4">
              <p className="text-sm text-camp-bark">
                {t('privacy.intro')}
              </p>

              <form onSubmit={(e) => void submitPrivacyRequest(e)} className="space-y-3">
                <div>
                  <label className="field-label">{t('privacy.type')}</label>
                  <select
                    className="field"
                    value={privacyType}
                    onChange={(e) => setPrivacyType(e.target.value as PrivacyRequestType)}
                  >
                    {(Object.keys(TYPE_LABELS) as PrivacyRequestType[]).map((k) => (
                      <option key={k} value={k}>{t(`privacy.types.${k}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">{t('privacy.message')}</label>
                  <textarea
                    className="field min-h-[80px] resize-y"
                    placeholder={t('privacy.messagePlaceholder')}
                    value={privacyMessage}
                    onChange={(e) => setPrivacyMessage(e.target.value)}
                    maxLength={1000}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={sendingPrivacy}>
                  {sendingPrivacy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {t('privacy.submit')}
                </button>
              </form>

              {myRequests.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold text-camp-pine-dark">{t('privacy.mine')}</h3>
                  <ul className="space-y-2">
                    {myRequests.map((r) => (
                      <li key={r._id} className="rounded-xl border border-camp-bark/15 bg-white/60 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-camp-pine-dark">{t(`privacy.types.${r.type}`)}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        {r.message && <p className="mt-1 text-camp-bark/80">{r.message}</p>}
                        {r.adminNote && (
                          <p className="mt-1 rounded bg-camp-sand/50 px-2 py-1 text-xs text-camp-ink">
                            <strong>{t('privacy.note')}</strong> {r.adminNote}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-camp-bark/50">
                          {formatDate(r.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3500} theme="colored" />
    </div>
  );
}
