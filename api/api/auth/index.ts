import { default as Register } from "./register";
import { default as Session } from "./session";

type API = Session | Register;

export type { API as default };
