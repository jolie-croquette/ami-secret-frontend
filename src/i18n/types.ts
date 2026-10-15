/**
 * Forme attendue d'une traduction : mêmes clés que la version française
 * (source de vérité), avec des chaînes libres. Une clé manquante ou en trop
 * côté anglais est une erreur de compilation.
 */
export type Translation<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? string[]
      : Translation<T[K]>;
};
