import { JwtPayload } from "./JwtPayload";

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
