export default function Footer() {
  return (
    <footer className="w-ful bg-green-50/80 backdrop-blur-md shadow-md border-t-green-100 border-2">
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-green-900">
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold">Ami Secret</h2>
          <p className="text-sm">Un jeu mystérieux pour des étés inoubliables 🌞🎁</p>
        </div>
        <p className="text-xs text-green-800 opacity-90">© {new Date().getFullYear()} Tous droits réservés</p>
      </div>

    </footer>
  );
}
