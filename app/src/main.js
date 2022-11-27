import { createApp } from "vue";
import App from "./App.vue";
import { createI18n } from "vue-i18n";

const params = new URLSearchParams(window.location.search);
const language = params.get("language");
const messages = {
  en: {
    assetsCash: "Cash",
    assetsSecurities: "Securities",
    assetsOther: "Other",
    assetsRealEstate: "Real Estate",
  },
  de: {
    assetsCash: "Cash",
    assetsSecurities: "Wertschriften",
    assetsOther: "Sonstige",
    assetsRealEstate: "Liegenschaften",
  },
};

const i18n = createI18n({
  locale: language,
  fallbackLocale: "en",
  messages: messages,
});

const app = createApp(App);
app.use(i18n);

app.mount("#app");
