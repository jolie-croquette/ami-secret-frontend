import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type User = {
  id: string;
  email: string;
  likes?: string[];
  dislikes?: string[];
  allergies?: string[];
  color?: string;
  animal?: string;
};

export default function PreferencesPage() {
  const [likes, setLikes] = useState(['']);
  const [dislikes, setDislikes] = useState(['']);
  const [allergies, setAllergies] = useState(['']);
  const [color, setColor] = useState('');
  const [animal, setAnimal] = useState('');
  const [errors, setErrors] = useState<{ likes?: boolean; color?: boolean; animal?: boolean }>({});
  const navigate = useNavigate();

  const handleChange = (setter: any, index: number, value: string) => {
    setter((prev: string[]) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleAdd = (setter: any) => setter((prev: string[]) => [...prev, '']);
  const handleRemove = (setter: any, index: number) =>
    setter((prev: string[]) => prev.filter((_, i) => i !== index));

  const isValidList = (list: string[]) => list.some(val => val.trim() !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      likes: !isValidList(likes),
      color: !color.trim(),
      animal: !animal.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Non authentifié");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ likes, dislikes, allergies, color, animal })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'envoi des préférences");
      }

      toast.success("Préférences enregistrées avec succès !");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Une erreur est survenue.");
    }
  };

  const renderListField = (label: string, values: string[], setter: any, required = false) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-green-900 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {values.map((val, i) => (
          <div
            key={i}
            className={`relative rounded-full border px-4 py-2 shadow-sm flex items-center ${
              required && errors.likes ? 'border-red-500' : 'border-yellow-300'
            } bg-white`}
          >
            <input
              type="text"
              className="bg-transparent pr-6 focus:outline-none"
              value={val}
              onChange={(e) => handleChange(setter, i, e.target.value)}
              placeholder={`${label} ${i + 1}`}
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(setter, i)}
                className="ml-2 text-red-500 hover:text-red-700 text-xs"
              >
                ❌
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAdd(setter)}
          className="rounded-full border border-dashed border-yellow-400 px-4 py-2 text-yellow-600 hover:bg-yellow-100 transition"
        >
          ➕ Ajouter
        </button>
      </div>
      {required && errors.likes && <p className="text-red-500 text-xs mt-1">Veuillez ajouter au moins un "j'aime".</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-yellow-50 py-20 px-4 flex justify-center items-start">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 border border-yellow-300"
      >
        <h1 className="text-3xl font-extrabold text-green-800 mb-8 text-center">
          Mes préférences
        </h1>

        {renderListField("J'aime", likes, setLikes, true)}
        {renderListField("J'aime pas", dislikes, setDislikes)}
        {renderListField("Allergies", allergies, setAllergies)}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-green-900 mb-2">Couleur préférée</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ex: Jaune, Bleu pastel, Lavande..."
            className={`w-full px-4 py-2 rounded-full border shadow-sm focus:ring-2 focus:ring-yellow-400 ${
              errors.color ? 'border-red-500' : 'border-yellow-300'
            }`}
          />
          {errors.color && <p className="text-red-500 text-xs mt-1">Veuillez indiquer une couleur préférée.</p>}
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-green-900 mb-2">Animal préféré</label>
          <input
            type="text"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            className={`w-full px-4 py-2 rounded-full border shadow-sm focus:ring-2 focus:ring-yellow-400 ${
              errors.animal ? 'border-red-500' : 'border-yellow-300'
            }`}
            placeholder="Ex: Panda, Chat, Dauphin..."
          />
          {errors.animal && <p className="text-red-500 text-xs mt-1">Veuillez indiquer un animal préféré.</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg"
        >
          Enregistrer mes préférences
        </button>
      </motion.form>
      <ToastContainer position="top-center" autoClose={4000} theme="colored" />
    </div>
  );
}
