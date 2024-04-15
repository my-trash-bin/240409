import { ComponentType, ReactNode } from "react";

import { Session } from "../Session";
import { Redirect } from "./Redirect";
import { withSession } from "./withSession";

export function requireSession<T>(
  component: ComponentType<T & Record<"session", Session | undefined>>,
  phase?: Session["phase"],
  fallback: ReactNode = <Redirect to="/login.html" />
): ComponentType<T> {
  const Component = component;

  return withSession(function RequireSession(props) {
    if (
      props.session === undefined ||
      (phase && phase !== props.session.phase)
    ) {
      return fallback;
    }

    return <Component {...props} />;
  });
}
