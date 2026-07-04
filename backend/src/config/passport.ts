/**
 * PASSPORT (OAuth) sozlamasi
 * --------------------------
 * Google va Discord strategiyalari. Sessiyasiz ishlaymiz (session: false) -
 * callback'da foydalanuvchini topamiz/yaratamiz va JWT beramiz.
 *
 * Har bir provayder faqat .env'da kalitlari bo'lsa yoqiladi.
 */

import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";
// passport-discord'da rasmiy tiplar yo'q - o'z e'lonimizni ishlatamiz
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Strategy as DiscordStrategy } from "passport-discord";

import {
  env,
  isGoogleConfigured,
  isDiscordConfigured,
} from "./env";
import { authService } from "../services/auth.service";

export function configurePassport() {
  if (isGoogleConfigured) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID as string,
          clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          callbackURL: `${env.OAUTH_CALLBACK_BASE}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: GoogleProfile,
          done: (err: unknown, user?: Express.User | false) => void
        ) => {
          try {
            const user = await authService.oauthUpsert({
              provider: "GOOGLE",
              providerId: profile.id,
              email: profile.emails?.[0]?.value ?? null,
              name: profile.displayName || "Google foydalanuvchi",
              avatar: profile.photos?.[0]?.value ?? null,
            });
            done(null, user as Express.User);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  if (isDiscordConfigured) {
    passport.use(
      new DiscordStrategy(
        {
          clientID: env.DISCORD_CLIENT_ID as string,
          clientSecret: env.DISCORD_CLIENT_SECRET as string,
          callbackURL: `${env.OAUTH_CALLBACK_BASE}/api/auth/discord/callback`,
          scope: ["identify", "email"],
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile: any,
          done: (err: unknown, user?: Express.User | false) => void
        ) => {
          try {
            const avatar = profile.avatar
              ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
              : null;
            const user = await authService.oauthUpsert({
              provider: "DISCORD",
              providerId: profile.id,
              email: profile.email ?? null,
              name:
                profile.global_name ||
                profile.username ||
                "Discord foydalanuvchi",
              avatar,
            });
            done(null, user as Express.User);
          } catch (err) {
            done(err);
          }
        }
      )
    );
  }

  return passport;
}
