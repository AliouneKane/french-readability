import React, { useEffect, useState } from "react";

// Grade-only, real-time. Labels mapped to the French system:
// Primaire, 6e, 5e, 4e, 3e, Seconde, Première, Terminale, Université, Doctorant, Agrégé.

export default function ReadabilityFRApp() {
  const [text, setText] = useState("");
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => setLabel(calculateGradeLabel(text)), 150);
    return () => clearTimeout(handler);
  }, [text]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Niveau de lecture (système français)</h1>
      <textarea
        className="w-full max-w-3xl h-80 border rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Collez ou saisissez votre texte ici"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {label && (
        <div className="mt-4 p-4 bg-white rounded-xl shadow-md w-full max-w-3xl">
          <p className="text-lg font-semibold">
            Niveau estimé : <span className="text-indigo-600">{label}</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Plus bas = plus facile à lire. Calcul basé sur longueur des phrases et densité syllabique (Flesch FR → étiquette).
          </p>
        </div>
      )}
    </div>
  );
}

// Compute Flesch FR, then map to French education labels.
function calculateGradeLabel(input: string): string {
  const text = input.trim();
  if (!text) return "";

  const sentences = splitSentences(text);
  const words = extractWords(text);
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);

  const W = Math.max(1, words.length);
  const S = Math.max(1, sentences.length);
  const asl = W / S;
  const spw = syllables / W;

  const fleschFR = 207 - 1.015 * asl - 73.6 * spw;

  // Map reading ease (≈0..100) to 16 buckets, then to labels below.
  const numeric = Math.max(1, Math.min(16, Math.round(16 - (fleschFR / 100) * 11)));

  const labels = [
    "Primaire",
    "Primaire",
    "Primaire",
    "6e",
    "5e",
    "4e",
    "3e",
    "Seconde",
    "Première",
    "Terminale",
    "Université",
    "Université",
    "Doctorant",
    "Doctorant",
    "Agrégé",
    "Agrégé",
  ] as const;

  return labels[numeric - 1] ?? "Agrégé";
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…;:])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractWords(text: string): string[] {
  return (text.match(/[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+(?:'[A-Za-zÀ-ÖØ-öø-ÿŒœÆæ]+)*/g) || []).filter(Boolean);
}

function countSyllables(word: string): number {
  if (!word) return 0;
  const vowels = "aeiouyàâäéèêëîïôöùûüÿœæ";
  let s = word.toLowerCase().normalize("NFC");
  s = s
    .replace(/eau/g, "€")
    .replace(/au/g, "§")
    .replace(/ai/g, "¶")
    .replace(/oi/g, "Ω")
    .replace(/ou/g, "∆")
    .replace(/eu/g, "≈")
    .replace(/œ/g, "≈")
    .replace(/æ/g, "≈");
  let groups = 0;
  let inVowel = false;
  for (const ch of s) {
    const isV = vowels.includes(ch) || "€§¶Ω∆≈".includes(ch);
    if (isV && !inVowel) { groups++; inVowel = true; }
    else if (!isV) { inVowel = false; }
  }
  if (/(e|es|ent)$/i.test(word) && !/(ée?s?|er|ez)$/i.test(word) && groups > 1) groups--;
  return Math.max(1, groups);
}
