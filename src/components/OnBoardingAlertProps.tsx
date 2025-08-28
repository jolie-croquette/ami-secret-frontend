import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type OnboardingAlertProps = {
  title?: string;
  message?: string;
  ctaLabel?: string;
  className?: string; // pour ajuster les marges selon la page
};

export default function OnboardingAlert({
  title = "Complète tes préférences 🎯",
  message = "Tu n’as pas encore inscrit tes préférences (couleur, animal, allergies, likes & dislikes). Cela aide ton ami(e) secret à te choisir des cadeaux pertinents.",
  ctaLabel = "Compléter maintenant",
  className = ""
}: OnboardingAlertProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl border border-yellow-300 bg-yellow-50/80 text-green-900 shadow-sm p-4 sm:p-5 ${className}`}
        >
          <div className="flex items-start gap-3">
            {/* Icône simple (SVG) */}
            <div className="mt-0.5 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16Zm-.75-10.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4Zm.75 8a1 1 0 100-2 1 1 0 000 2Z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-base sm:text-lg">{title}</h3>
              <p className="mt-1 text-sm sm:text-base text-green-800">
                {message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/onboard')}
                  className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                >
                  {ctaLabel}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-full text-green-800 hover:bg-yellow-100 font-medium"
                  aria-label="Fermer l’alerte"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
