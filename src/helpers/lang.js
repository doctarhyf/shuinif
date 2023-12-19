const LANGS = {
  fr: { name: "Francais" },
  sw: { name: "Swahili" },
  zh: { name: "中文" },
};

const STRINGS = {
  welcome_message: {
    fr: "Bienvenu sur Shui Ni Che Jian Mr %s",
    en: "Welcome to Shui Ni Che Jian Mr %s",
    zh: "欢迎来 %s 先生",
  },
};

export function GetString(stringName, params, lang = "fr") {
  return STRINGS[stringName][lang] || "-- no string found --";
}
