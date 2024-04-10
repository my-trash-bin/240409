import "dotenv/config";

import Express from "express";
import ExpressSession from "express-session";
import Passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { deserialize, serialize } from "./JwtPayload.js";
import { prisma } from "./prisma.js";
import { env } from "./util/env.js";

const app = Express();

app.use(
  ExpressSession({ secret: "secret", resave: false, saveUninitialized: false })
);
app.use(Passport.initialize());
app.use(Passport.session());
app.use(Express.static("public"));

Passport.use(
  new GoogleStrategy(
    {
      clientID: env("GOOGLE_CLIENT_ID"),
      clientSecret: env("GOOGLE_CLIENT_SECRET"),
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const userId =
        req.user?.state.phase === "authenticated"
          ? req.user.state.id
          : undefined;
      const oauthAccount = await prisma.oAuthAccount.upsert({
        where: {
          provider_externalId: { provider: "google", externalId: profile.id },
        },
        create: {
          provider: "google",
          externalId: profile.id,
          accessToken,
          refreshToken,
          ...(userId && { user: { connect: { id: userId } } }),
        },
        update: { accessToken, refreshToken },
        include: { user: true },
      });
      if (!oauthAccount.user) {
        done(null, { state: { phase: "oauthOnly", id: oauthAccount.id } });
      } else {
        done(null, {
          state: {
            phase: "authenticated",
            id: oauthAccount.user.id,
            nickname: oauthAccount.user.nickname,
          },
        });
      }
    }
  )
);

Passport.serializeUser((user, done) => {
  done(null, serialize(user));
});

Passport.deserializeUser(async (input: string, done) => {
  done(null, await deserialize(input));
});

app.get(
  "/api/auth/google",
  Passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  Passport.authenticate("google", { failureRedirect: "/login" }),
  async function (req, res) {
    switch (req.user?.state.phase) {
      case "oauthOnly":
        res.redirect("/register.html");
    }
  }
);

app.get("/api/auth/session", function (req, res) {
  res.json(req.user ?? null);
});

const PORT = env("PORT");
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
