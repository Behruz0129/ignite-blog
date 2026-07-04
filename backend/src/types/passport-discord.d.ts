/**
 * passport-discord uchun minimal tip e'loni (rasmiy @types yo'q).
 * Faqat bizga kerak bo'lgan qismlarni ta'riflaymiz.
 */
declare module "passport-discord" {
  import { Strategy as PassportStrategy } from "passport";

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[] | string;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any,
    done: (err: unknown, user?: unknown) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }
}
