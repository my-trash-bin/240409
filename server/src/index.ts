import "dotenv/config";

import CookieParser from "cookie-parser";
import Express from "express";
import Jwt from "jsonwebtoken";
import Passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as KakaoStrategy } from "passport-kakao";

import { JwtPayload, deserialize, serialize } from "./JwtPayload.js";
import { isUniqueConstraintError } from "./prisma/isUniqueConstraintError.js";
import { prisma } from "./prisma/prisma.js";
import { env } from "./util/env.js";

const app = Express();

app.use(Express.json());
app.use(CookieParser());
app.use(Passport.initialize());
app.use(Express.static("public"));

Passport.use(
  new KakaoStrategy(
    {
      clientID: env("KAKAO_CLIENT_ID"),
      clientSecret: env("KAKAO_CLIENT_SECRET"),
      callbackURL: "/api/auth/kakao/callback",
      passReqToCallback: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      const userId =
        req.user?.state.phase === "authenticated"
          ? req.user.state.id
          : undefined;
      const oauthAccount = await prisma.oAuthAccount.upsert({
        where: {
          provider_externalId: {
            provider: "kakao",
            externalId: `${profile.id}`,
          },
        },
        create: {
          provider: "kakao",
          externalId: `${profile.id}`,
          accessToken,
          refreshToken,
          ...(userId && { user: { connect: { id: userId } } }),
        },
        update: { accessToken, refreshToken },
        select: { id: true, user: true },
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
        select: { id: true, user: true },
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

Passport.use(
  new JwtStrategy(
    {
      secretOrKey: env("JWT_KEY"),
      jwtFromRequest: (req) => req.cookies?.jwt ?? null,
    },
    (payload: JwtPayload, done) => {
      done(null, payload);
    }
  )
);

Passport.serializeUser((user, done) => {
  done(null, serialize(user));
});

Passport.deserializeUser(async (input: string, done) => {
  done(null, await deserialize(input));
});

app.use(
  "/api",
  (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    Passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: JwtPayload) => {
        if (err) {
          return next(err);
        }
        if (user) {
          req.user = user;
        }
        next();
      }
    )(req, res, next);
  }
);

app.get(
  "/api/auth/kakao",
  Passport.authenticate("kakao", {
    scope: "profile",
    session: false,
  })
);

app.get(
  "/api/auth/kakao/callback",
  Passport.authenticate("kakao", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    switch (req.user?.state.phase) {
      case "oauthOnly": {
        const payload: JwtPayload = { state: req.user.state };
        const jwt = Jwt.sign(payload, env("JWT_KEY"));
        res.cookie("jwt", jwt, { httpOnly: true, maxAge: 86400000 });
        res.redirect("/register.html");
        break;
      }
      case "authenticated": {
        const payload: JwtPayload = { state: req.user.state };
        const jwt = Jwt.sign(payload, env("JWT_KEY"));
        res.cookie("jwt", jwt, { httpOnly: true, maxAge: 86400000 });
        res.redirect("/");
        break;
      }
      default:
    }
  }
);

app.get(
  "/api/auth/google",
  Passport.authenticate("google", { scope: ["email"], session: false })
);

app.get(
  "/api/auth/google/callback",
  Passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    switch (req.user?.state.phase) {
      case "oauthOnly": {
        const payload: JwtPayload = { state: req.user.state };
        const jwt = Jwt.sign(payload, env("JWT_KEY"));
        res.cookie("jwt", jwt, { httpOnly: true, maxAge: 86400000 });
        res.redirect("/register.html");
        break;
      }
      case "authenticated": {
        const payload: JwtPayload = { state: req.user.state };
        const jwt = Jwt.sign(payload, env("JWT_KEY"));
        res.cookie("jwt", jwt, { httpOnly: true, maxAge: 86400000 });
        res.redirect("/");
        break;
      }
      default:
    }
  }
);

app.get("/api/auth/session", (req, res) => {
  res.json(req.user ?? null);
});

app.get("/api/auth/logout", (_req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("jwt");
  res.json({ ok: true });
});

app.post("/api/auth/register", async (req, res) => {
  if (req.user?.state.phase !== "oauthOnly") {
    res.status(403).json({ message: "Access  denied" });
    return;
  }
  if (typeof req.body?.nickname !== "string") {
    res.status(400).json({ message: "Parameter `nickname` is missing" });
    return;
  }
  const state = req.user.state;
  try {
    const oAuth = await prisma.oAuthAccount.update({
      where: { id: state.id },
      data: { user: { create: { nickname: req.body.nickname } } },
      select: { user: { select: { id: true, nickname: true } } },
    });
    const payload: JwtPayload = {
      state: {
        phase: "authenticated",
        id: oAuth.user!.id,
        nickname: oAuth.user!.nickname,
      },
    };
    const jwt = Jwt.sign(payload, env("JWT_KEY"));
    res.cookie("jwt", jwt, { httpOnly: true, maxAge: 86400000 });
    res.json({ success: true });
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      res.json({ success: false });
    }
  }
});

const PORT = env("PORT");
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
