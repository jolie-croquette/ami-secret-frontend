import { Heart, TreePine } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      role="contentinfo"
      className="w-full border-t-2 border-camp-bark/15 bg-camp-pine text-camp-cream"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-4 px-6 py-7 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-camp-sun" />
          <h2 className="font-display text-lg font-black tracking-tight">Ami Secret</h2>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-camp-cream/85">
          Fait avec <Heart className="h-4 w-4 fill-camp-ember text-camp-ember" /> par Splash (Xavier Samson)
        </p>
        <div className="flex flex-col items-center gap-1 md:items-end">
          <p className="text-xs text-camp-cream/70">© {year} Tous droits réservés</p>
          <div className="flex gap-3 text-xs text-camp-cream/60">
            <Link to="/privacy" className="hover:text-camp-cream transition-colors">
              Confidentialité
            </Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-camp-cream transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
