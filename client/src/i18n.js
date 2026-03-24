import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        feed: "Feed",
        follow: "Follow",
        upload: "Upload",
        profile: "Profile",
        chat: "Chat",
      },
    },
    rw: {
      translation: {
        feed: "Ibyatangajwe",
        follow: "Kurikira",
        upload: "Ohereza",
        profile: "Umwirondoro",
        chat: "Ikiganiro",
      },
    },
    fr: {
      translation: {
        feed: "Fil",
        follow: "Suivre",
        upload: "Publier",
        profile: "Profil",
        chat: "Discussion",
      },
    },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;