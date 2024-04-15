"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { API } from "../../../API";
import { requireSession } from "../../../components/requireSession";
import { useAsyncCallback } from "../../../hooks/useAsyncCallback";
import { useInputChangeEventHandler } from "../../../hooks/useInputChangeEventHandler";

export default requireSession(function Page({ session }) {
  const [nickname, setNickname] = useState("");
  const handleNicknameChange = useInputChangeEventHandler(setNickname);
  const router = useRouter();
  const [handleClick] = useAsyncCallback(async () => {
    const result = await API<"POST", "/api/auth/register">(
      "POST",
      "/api/auth/register",
      undefined,
      { nickname }
    );
    if (result.success) {
      router.push("/welcome.html");
    } else {
      alert("Nickname duplicates.\nChoose a different nickname.");
    }
  }, [nickname]);

  return (
    <div>
      <input
        value={nickname}
        onChange={handleNicknameChange}
        placeholder="Enter your new nickname"
      />
      <button type="button" onClick={handleClick}>
        Register
      </button>
    </div>
  );
}, "oauthOnly");
