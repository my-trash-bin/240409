"use client";

import { withSession } from "../components/withSession";

export default withSession(function Page({ session }) {
  if (session === null) {
    return <div>Loading...</div>;
  }
  if (session === undefined) {
    return <div>Not logged in</div>;
  }
  switch (session.phase) {
    case "oauthOnly": {
      return <div>OAuth only ({session.id})</div>;
    }
    case "authenticated": {
      return (
        <div>
          Logged in as {session.nickname} ({session.id})
        </div>
      );
    }
  }
});
