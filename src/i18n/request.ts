import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  let messages;
  switch (locale) {
    case "en":
      messages = (await import("@/messages/en.json")).default;
      break;
    default:
      messages = (await import("@/messages/zh.json")).default;
  }

  return {
    locale,
    messages,
  };
});
