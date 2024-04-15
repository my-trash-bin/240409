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

export default interface API {
  method: "GET";
  path: "/api/auth/session";
  response: JwtPayload | null;
}
