import { ComponentType, useEffect, useState } from "react";

import { API } from "../API";
import { Session } from "../Session";

export function withSession<T>(
  component: ComponentType<T & Record<"session", Session | undefined>>
): ComponentType<T> {
  const Component = component;

  return function WithSession(props: T) {
    const [session, setSession] = useState<Session | null | undefined>(null);
    useEffect(() => {
      (async () => {
        setSession((await API("GET:/api/auth/session"))?.state);
      })();
    }, []);

    if (session === null) {
      return <div>Loading...</div>;
    }

    return <Component {...props} session={session} />;
  };
}
