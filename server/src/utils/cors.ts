import { CorsOptions } from "cors";
import { FRONTEND_URL } from "../constant/env";
import { MOBILE_URL } from "../constant/env";

const normalizedFrontendUrl = FRONTEND_URL.replace(/\/+$/, "");
const normalizedMobileUrl = MOBILE_URL.replace(/\/+$/, "");
// const normalizedBackendUrl = BACKEND_URL.replace(/\/+$/, '');

export const corsOptions: CorsOptions = {
  origin: [normalizedFrontendUrl, normalizedMobileUrl],
  credentials: true,
};
