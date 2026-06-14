import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { env } from "../env/env";

function loadServiceAccount(): object | null {
  const credentialsPath = resolve(process.cwd(), "src/shared/firebase/firebase_credentials.json");

  if (existsSync(credentialsPath)) {
    return JSON.parse(readFileSync(credentialsPath, "utf-8"));
  }

  if (env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  return null;
}

function initFirebase() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const serviceAccount = loadServiceAccount();

  if (!serviceAccount) {
    console.warn("[Firebase] Credenciais não encontradas — push notifications desativadas.");
    return initializeApp();
  }

  return initializeApp({ credential: cert(serviceAccount as any) });
}

initFirebase();

export function getFirebaseMessaging(): Messaging {
  return getMessaging();
}
