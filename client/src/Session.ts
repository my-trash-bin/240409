import API from "@this-project/api";

export type Session =
  | NonNullable<
      Extract<API, Record<"path", "/api/auth/session">>["response"]
    >["state"]
  | undefined;
