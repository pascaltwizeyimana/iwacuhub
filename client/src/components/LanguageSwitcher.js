import i18n from "i18next";

export default function LanguageSwitcher() {
  return (
    <select
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border p-1 rounded"
    >
      <option value="en">English</option>
      <option value="rw">Kinyarwanda</option>
      <option value="fr">Français</option>
    </select>
  );
}