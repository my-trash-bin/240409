import { prisma } from "./prisma/prisma.js";

export interface JwtPayloadStateAuthenticated {
  phase: "authenticated";
  nickname: string;
  id: number;
}

export interface JwtPayloadStateOauthOnly {
  phase: "oauthOnly";
  id: number;
}

export type JwtPayloadState =
  | JwtPayloadStateAuthenticated
  | JwtPayloadStateOauthOnly;

export interface JwtPayload {
  state: JwtPayloadState;
}

export function serialize(payload: JwtPayload): string {
  switch (payload.state.phase) {
    case "authenticated":
      return `authenticated:${payload.state.id}`;
    case "oauthOnly":
      return `oauthOnly:${payload.state.id}`;
  }
}

export async function deserialize(input: string): Promise<JwtPayload> {
  const [type, id] = input.split(":");
  const actualId = id && parseInt(id);
  if (!actualId || isNaN(actualId) || Math.floor(actualId) !== actualId)
    throw new Error(`Invalid session: ${input}`);
  switch (type) {
    case "authenticated": {
      const user = await prisma.user.findUnique({ where: { id: actualId } });
      if (!user) throw new Error(`Invalid session: ${input}`);
      return {
        state: {
          phase: "authenticated",
          id: user.id,
          nickname: user.nickname,
        },
      };
    }
    case "oauthOnly": {
      const oauthAccount = await prisma.oAuthAccount.findUnique({
        where: { id: actualId },
      });
      if (!oauthAccount) throw new Error(`Invalid session: ${input}`);
      return {
        state: {
          phase: "oauthOnly",
          id: oauthAccount.id,
        },
      };
    }
    default:
      throw new Error(`Invalid session: ${input}`);
  }
}
