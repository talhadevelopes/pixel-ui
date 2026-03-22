//mailjet
export const MAILJET_API_KEY = process.env.MAILJET_API_KEY || "";
export const MAILJET_API_SECRET = process.env.MAILJET_API_SECRET || "";
export const MAILJET_FROM_EMAIL =
  process.env.MAILJET_FROM_EMAIL || "trainedbot10k@gmail.com";
export const MAILJET_FROM_NAME = process.env.MAILJET_FROM_NAME || "PixelUI";
export const OTP_EXPIRY_MINUTES = 10;


//jwt
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string | undefined;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string | undefined;

//google
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";