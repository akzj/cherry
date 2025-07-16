import { User } from "./models";


declare global {
  interface Window {
    __CURRENT_USER_ID__?: string;
    __AUTO_INCREMENT_ID__: number;
    __USER__?: User;
  }
}
