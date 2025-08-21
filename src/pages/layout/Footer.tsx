import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      role="contentinfo"
      className="w-full bg-green-50/80 backdrop-blur-md border-t border-green-100 shadow-[0_-1px_0_0_rgba(0,0,0,0.02)]"
    >
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-green-900">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-extrabold tracking-tight">Ami(e) Secret</h2>
        </div>
        <div className='text-center text-green-800/90 pb-3'>
          <p> Fait avec ❤️ par Splash (Xavier Samson)</p>
        </div>
        <p className="text-xs text-green-800/90">© {year} Tous droits réservés</p>
      </div>
    </footer>
  );
}
