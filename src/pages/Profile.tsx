import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { motion } from 'motion/react';
import { toast, ToastContainer } from 'react-toastify';
import { X, Heart, HeartCrack, ShieldAlert, Palette, PawPrint, Loader2, Mail, Gift, ShieldCheck, ChevronDown, Bell, BellOff, BellRing } from 'lucide-react';
import { userApi } from '@/api/user';
import type { WishlistItem } from '@/api/types';
import WishlistEditor from '@/components/WishlistEditor';
import { MeritBadge } from '@/components/visuals/CampVisuals';
import {
  privacyRequestApi,
  TYPE_LABELS,
  STATUS_LABELS,
  type PrivacyRequestType,
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? ''}`}>
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
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
        {values.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-camp-sand px-3 py-1 text-sm font-semibold text-camp-pine-dark">
            {t}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-camp-berry">
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
      if (!publicKey) throw new Error('Clé publique manquante.');
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
      toast.success('Notifications activées sur cet appareil.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'activation.");
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
      toast.success('Notifications désactivées pour cet appareil.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de désactivation.');
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
          <span className="font-display text-lg font-bold text-camp-pine-dark">Notifications</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-camp-bark transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-camp-bark/10 px-6 pb-6 pt-4">
          {permission === 'unsupported' && (
            <div className="flex items-start gap-3 rounded-xl bg-camp-sand/60 p-4 text-sm text-camp-bark">
              <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-camp-bark/60" />
              <p>Ton navigateur ne supporte pas les notifications push.</p>
            </div>
          )}

          {permission === 'denied' && (
            <div className="flex items-start gap-3 rounded-xl bg-camp-berry/10 p-4 text-sm text-camp-berry">
              <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Notifications bloquées par le navigateur.</p>
                <p className="mt-1 text-camp-berry/80">
                  Pour les réactiver, ouvre les paramètres de ton navigateur et autorise les notifications pour ce site.
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
                      {subscribed ? 'Activées sur cet appareil' : 'Désactivées sur cet appareil'}
                    </p>
                    <p className="text-xs text-camp-bark/60">
                      {subscribed
                        ? "Tu reçois des alertes pour les messages et les tirages."
                        : "Tu ne reçois pas d'alertes sur cet appareil."}
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
                  Désactiver sur cet appareil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void subscribe()}
                  disabled={busy}
                  className="btn-primary w-full justify-center"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  Activer les notifications
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
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigate = useNavigate();

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
        toast.error(err instanceof Error ? err.message : 'Erreur de chargement.');
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
      toast.success('Demande soumise. Je la traiterai dans les 30 jours.');
      setPrivacyMessage('');
      await loadMyRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setSendingPrivacy(false);
    }
  };

  const save = async () => {
    if (likes.length === 0) return toast.warning("Ajoute au moins un « j'aime ».");
    if (!color.trim() || !animal.trim()) return toast.warning('Couleur et animal sont requis.');
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
      toast.success('Profil mis à jour.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de sauvegarde.');
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

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-camp-pine" />
          </div>
        ) : (
          <div className="card-sign space-y-5 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-camp-pine-dark">Préférences cadeaux</h2>
            <TagInput label="J'aime" icon={Heart} values={likes} onChange={setLikes} placeholder="Ex : chocolat noir, plein air…" />
            <TagInput label="Je n'aime pas" icon={HeartCrack} values={dislikes} onChange={setDislikes} placeholder="Ex : réglisse…" />
            <TagInput label="Allergies" icon={ShieldAlert} values={allergies} onChange={setAllergies} placeholder="Ex : arachides…" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label flex items-center gap-2">
                  <Palette className="h-4 w-4 text-camp-pine" /> Couleur préférée
                </label>
                <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex : Bleu pastel" className="field" />
              </div>
              <div>
                <label className="field-label flex items-center gap-2">
                  <PawPrint className="h-4 w-4 text-camp-pine" /> Animal préféré
                </label>
                <input value={animal} onChange={(e) => setAnimal(e.target.value)} placeholder="Ex : Renard" className="field" />
              </div>
            </div>

            <div>
              <label className="field-label flex items-center gap-2">
                <Gift className="h-4 w-4 text-camp-pine" /> Liste de souhaits
              </label>
              <p className="mb-2 text-xs text-camp-bark">
                Des idées précises (avec lien et prix) pour aider ton ami secret.
              </p>
              <WishlistEditor items={wishlist} onChange={setWishlist} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer'}
              </button>
              <button onClick={() => navigate('/dashboard')} disabled={saving} className="btn-ghost">
                Retour
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
              <span className="font-display text-lg font-bold text-camp-pine-dark">Mes droits vie privée</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-camp-bark transition-transform ${privacyOpen ? 'rotate-180' : ''}`} />
          </button>

          {privacyOpen && (
            <div className="space-y-5 border-t border-camp-bark/10 px-6 pb-6 pt-4">
              <p className="text-sm text-camp-bark">
                Conformément à la Loi 25 (LPRPSP), tu peux exercer les droits suivants. Je traite chaque demande dans un délai de 30 jours.
              </p>

              <form onSubmit={(e) => void submitPrivacyRequest(e)} className="space-y-3">
                <div>
                  <label className="field-label">Type de demande</label>
                  <select
                    className="field"
                    value={privacyType}
                    onChange={(e) => setPrivacyType(e.target.value as PrivacyRequestType)}
                  >
                    {(Object.entries(TYPE_LABELS) as [PrivacyRequestType, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Message (optionnel)</label>
                  <textarea
                    className="field min-h-[80px] resize-y"
                    placeholder="Précise ta demande si nécessaire…"
                    value={privacyMessage}
                    onChange={(e) => setPrivacyMessage(e.target.value)}
                    maxLength={1000}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={sendingPrivacy}>
                  {sendingPrivacy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Soumettre la demande
                </button>
              </form>

              {myRequests.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold text-camp-pine-dark">Mes demandes</h3>
                  <ul className="space-y-2">
                    {myRequests.map((r) => (
                      <li key={r._id} className="rounded-xl border border-camp-bark/15 bg-white/60 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-camp-pine-dark">{TYPE_LABELS[r.type]}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        {r.message && <p className="mt-1 text-camp-bark/80">{r.message}</p>}
                        {r.adminNote && (
                          <p className="mt-1 rounded bg-camp-sand/50 px-2 py-1 text-xs text-camp-ink">
                            <strong>Note :</strong> {r.adminNote}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-camp-bark/50">
                          {new Date(r.createdAt).toLocaleDateString('fr-CA')}
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
