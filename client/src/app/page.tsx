'use client';

import API from "@this-project/api";
import { useEffect, useState } from "react";
import { API as APICall } from "./API";

export default function Page() {
  const [session, setSession] = useState<NonNullable<Extract<API, { path: '/api/auth/session' }>['response']>['state'] | null | undefined>(null);
  useEffect(() => {
    (async () => {
      setSession((await APICall('GET', '/api/auth/session', undefined))?.state);
    })();
  }, []);

  if (session === null) {
    return <div>Loading...</div>;
  }
  if (session === undefined) {
    return <div>Not logged in</div>
  }
  switch (session.phase) {
    case "oauthOnly": {
      return <div>OAuth only ({session.id})</div>;
    }
    case "authenticated": {
      return <div>Logged in as {session.nickname} ({session.id})</div>;
    }
  }
}
