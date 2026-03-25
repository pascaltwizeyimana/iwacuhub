import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      // General
      appName: 'IwacuHub',
      slogan: "Rwanda's Premier Social Platform",
      welcome: 'Welcome to IwacuHub',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      logout: 'Logout',
      search: 'Search',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      
      // Feed
      feed: 'Feed',
      forYou: 'For You',
      following: 'Following',
      trending: 'Trending',
      suggested: 'Suggested for you',
      follow: 'Follow',
      unfollow: 'Unfollow',
      
      // Actions
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      save: 'Save',
      addComment: 'Add a comment...',
      upload: 'Upload',
      live: 'Go Live',
      
      // Stats
      activeUsers: 'Active Users',
      dailyPosts: 'Daily Posts',
      dailyLikes: 'Daily Likes',
      views: 'views',
      
      // Messages
      loginRequired: 'Login Required',
      loginToInteract: 'Please login to interact with this content',
      createAccount: 'Create Account',
      maybeLater: 'Maybe later',
      
      // Rwanda specific
      rwandaFacts: 'Did You Know?',
      gorillaFact: 'Rwanda is home to over 1,000 mountain gorillas - half of the world\'s population!',
      hillsFact: 'The country is known as "Land of a Thousand Hills" with over 1,000 hills!',
      coffeeFact: 'Rwandan coffee is among the world\'s finest, known for its rich flavor.',
      
      // Search
      searchUsers: 'Search users...',
      searchPosts: 'Search posts...',
      searchHashtags: 'Search hashtags...',
      noResults: 'No results found',
      
      // Chat
      messages: 'Messages',
      typeMessage: 'Type a message...',
      online: 'Online',
      offline: 'Offline',
      typing: 'typing...',
      
      // Upload
      uploadContent: 'Upload Content',
      selectFile: 'Select file',
      caption: 'Caption',
      chooseType: 'Choose content type',
      post: 'Post',
      reel: 'Reel',
      video: 'Video',
      
      // Live Stream
      liveStream: 'Live Stream',
      startLive: 'Start Live Stream',
      watching: 'watching',
      viewers: 'viewers',
      
      // Dark Mode
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      systemMode: 'System Mode',
      
      // Notifications
      newLike: 'liked your post',
      newComment: 'commented on your post',
      newFollow: 'started following you',
      newMessage: 'sent you a message',
      markAllRead: 'Mark all as read',
      
      // Time
      justNow: 'just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      weeksAgo: 'weeks ago',
    }
  },
  fr: {
    translation: {
      // General
      appName: 'IwacuHub',
      slogan: "La plateforme sociale numéro 1 du Rwanda",
      welcome: 'Bienvenue sur IwacuHub',
      signIn: 'Se connecter',
      signUp: "S'inscrire",
      logout: 'Déconnexion',
      search: 'Rechercher',
      notifications: 'Notifications',
      profile: 'Profil',
      settings: 'Paramètres',
      
      // Feed
      feed: 'Flux',
      forYou: 'Pour vous',
      following: 'Abonnements',
      trending: 'Tendances',
      suggested: 'Suggestions',
      follow: 'Suivre',
      unfollow: 'Ne plus suivre',
      
      // Actions
      like: 'J\'aime',
      comment: 'Commenter',
      share: 'Partager',
      save: 'Enregistrer',
      addComment: 'Ajouter un commentaire...',
      upload: 'Publier',
      live: 'En direct',
      
      // Stats
      activeUsers: 'Utilisateurs actifs',
      dailyPosts: 'Publications quotidiennes',
      dailyLikes: 'J\'aime quotidiens',
      views: 'vues',
      
      // Messages
      loginRequired: 'Connexion requise',
      loginToInteract: 'Veuillez vous connecter pour interagir avec ce contenu',
      createAccount: 'Créer un compte',
      maybeLater: 'Plus tard',
      
      // Rwanda specific
      rwandaFacts: 'Le saviez-vous ?',
      gorillaFact: 'Le Rwanda abrite plus de 1 000 gorilles de montagne - la moitié de la population mondiale !',
      hillsFact: 'Le pays est connu comme le "Pays des Mille Collines" avec plus de 1 000 collines !',
      coffeeFact: 'Le café rwandais est parmi les meilleurs au monde, connu pour sa saveur riche.',
      
      // Search
      searchUsers: 'Rechercher des utilisateurs...',
      searchPosts: 'Rechercher des publications...',
      searchHashtags: 'Rechercher des hashtags...',
      noResults: 'Aucun résultat trouvé',
      
      // Chat
      messages: 'Messages',
      typeMessage: 'Écrivez un message...',
      online: 'En ligne',
      offline: 'Hors ligne',
      typing: 'écrit...',
      
      // Upload
      uploadContent: 'Publier du contenu',
      selectFile: 'Sélectionner un fichier',
      caption: 'Légende',
      chooseType: 'Choisir le type de contenu',
      post: 'Publication',
      reel: 'Reel',
      video: 'Vidéo',
      
      // Live Stream
      liveStream: 'Diffusion en direct',
      startLive: 'Commencer le direct',
      watching: 'regardent',
      viewers: 'spectateurs',
      
      // Dark Mode
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair',
      systemMode: 'Mode système',
      
      // Notifications
      newLike: 'a aimé votre publication',
      newComment: 'a commenté votre publication',
      newFollow: 'a commencé à vous suivre',
      newMessage: 'vous a envoyé un message',
      markAllRead: 'Tout marquer comme lu',
      
      // Time
      justNow: 'à l\'instant',
      minutesAgo: 'minutes',
      hoursAgo: 'heures',
      daysAgo: 'jours',
      weeksAgo: 'semaines',
    }
  },
  kin: {
    translation: {
      // General - Kinyarwanda
      appName: 'IwacuHub',
      slogan: 'Urubuga rwa mbere mu Rwanda',
      welcome: 'Murakaza neza kuri IwacuHub',
      signIn: 'Injira',
      signUp: 'Iyandikishe',
      logout: 'Sohoka',
      search: 'Shakisha',
      notifications: 'Imenyesha',
      profile: 'Ibyerekeye',
      settings: 'Igenamiterere',
      
      // Feed
      feed: 'Inkuru',
      forYou: 'Kuri wewe',
      following: 'Urikurikira',
      trending: 'Bikunzwe',
      suggested: 'Twagushije',
      follow: 'Kurikira',
      unfollow: 'Reka gukurikira',
      
      // Actions
      like: 'Gukunda',
      comment: 'Kuvuga',
      share: 'Gahana',
      save: 'Bika',
      addComment: 'Ongeraho igitekerezo...',
      upload: 'Ohereza',
      live: 'Kuri Live',
      
      // Stats
      activeUsers: 'Abakoresha',
      dailyPosts: 'Inyandiko ku munsi',
      dailyLikes: 'Urukundo ku munsi',
      views: 'reba',
      
      // Messages
      loginRequired: 'Injira mbere',
      loginToInteract: 'Injira mbere yo gukora iki gikorwa',
      createAccount: 'Fungua konti',
      maybeLater: 'Ubundi',
      
      // Rwanda specific
      rwandaFacts: 'Urabizi?',
      gorillaFact: 'Rwanda niho hari ingagi nyinshi ku isi - ibarirwa 1000!',
      hillsFact: 'Rwanda ni "Igihugu cy\'Imisozi Igihumbi"!',
      coffeeFact: 'Ikawa ya Rwanda ni nziza ku isi!',
      
      // Search
      searchUsers: 'Shakisha abakoresha...',
      searchPosts: 'Shakisha inyandiko...',
      searchHashtags: 'Shakisha hashtags...',
      noResults: 'Nta kibonetse',
      
      // Chat
      messages: 'Ubutumwa',
      typeMessage: 'Andika ubutumwa...',
      online: 'Uriho',
      offline: 'Nturiho',
      typing: 'arandika...',
      
      // Upload
      uploadContent: 'Ohereza ibintu',
      selectFile: 'Hitamo dosiye',
      caption: 'Ibisobanuro',
      chooseType: 'Hitamo ubwoko',
      post: 'Inyandiko',
      reel: 'Reel',
      video: 'Amafirime',
      
      // Live Stream
      liveStream: 'Live',
      startLive: 'Tangiza Live',
      watching: 'bareba',
      viewers: 'bareba',
      
      // Dark Mode
      darkMode: 'Umwijima',
      lightMode: 'Umucyo',
      systemMode: 'Nkuko system',
      
      // Notifications
      newLike: 'yakunze ikintu cyawe',
      newComment: 'yavuze ku ikintu cyawe',
      newFollow: 'yatangiye kukurikira',
      newMessage: 'yakohereje ubutumwa',
      markAllRead: 'Shyira byose nkibisomwe',
      
      // Time
      justNow: 'akanya gato',
      minutesAgo: 'iminota',
      hoursAgo: 'amasaha',
      daysAgo: 'iminsi',
      weeksAgo: 'ibyumweru',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;