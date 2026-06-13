import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errCode = (error && typeof error === "object" && "code" in error) ? (error as any).code : "";

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };

  console.error("Firestore Error: ", JSON.stringify(errInfo));

  // Only throw if it contains permission-denied / missing or insufficient permissions to assist AI rules debugging.
  // Standard connection, unavailable, timeout, or quota errors should not throw to prevent crashing the whole app interface.
  const isPermissionError =
    errCode === "permission-denied" ||
    errMessage.toLowerCase().includes("permission") ||
    errMessage.toLowerCase().includes("insufficient");

  if (isPermissionError) {
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn("Transient / Connection Firestore Error (ignored to keep app running in offline mode):", errMessage);
  }
}
