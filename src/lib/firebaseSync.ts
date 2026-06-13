import { db, handleFirestoreError, OperationType } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { PhoneUser, ActasState } from "../types";

const USERS_COLLECTION = "users";
const DRAFTS_COLLECTION = "drafts";

/**
 * Seube a la base de datos de Firebase la lista de agentes PNP por defecto
 * si es que la colección en la nube está vacía.
 */
export async function seedDefaultUsersIfNeeded(defaultUsers: PhoneUser[]) {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      console.log("Firebase users collection is empty. Seeding defaults...");
      const batch = writeBatch(db);
      
      defaultUsers.forEach((user) => {
        if (user.phoneNumber) {
          const docRef = doc(db, USERS_COLLECTION, user.phoneNumber);
          batch.set(docRef, {
            phoneNumber: user.phoneNumber,
            tokens: user.tokens || 0,
            autorizado: user.autorizado ?? true,
            user_gemini_api_key: user.user_gemini_api_key || "",
          });
        }
      });
      
      await batch.commit();
      console.log("Successfully seeded default agents to Firebase Firestore.");
    }
  } catch (error) {
    console.error("Error checking or seeding users collection: ", error);
  }
}

/**
 * Suscribe los usuarios autorizados de Firebase en tiempo real
 */
export function subscribeToUsers(onUpdate: (users: PhoneUser[]) => void, onError?: (err: any) => void) {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const usersList: PhoneUser[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        usersList.push({
          phoneNumber: data.phoneNumber,
          tokens: data.tokens || 0,
          autorizado: data.autorizado !== false,
          user_gemini_api_key: data.user_gemini_api_key || "",
        });
      });
      onUpdate(usersList);
    },
    (err) => {
      console.error("Error listening to users collection:", err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
    }
  );
}

/**
 * Guarda o actualiza un agente PNP en Firebase.
 */
export async function saveUserToFirebase(user: PhoneUser) {
  if (!user.phoneNumber) return;
  const path = `${USERS_COLLECTION}/${user.phoneNumber}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, user.phoneNumber);
    await setDoc(
      docRef,
      {
        phoneNumber: user.phoneNumber,
        tokens: user.tokens || 0,
        autorizado: user.autorizado !== false,
        user_gemini_api_key: user.user_gemini_api_key || "",
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Elimina un agente de Firebase.
 */
export async function deleteUserFromFirebase(phoneNumber: string) {
  const path = `${USERS_COLLECTION}/${phoneNumber}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, phoneNumber);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Carga el estado del borrador de actas de un agente desde Firebase.
 */
export async function loadUserDraft(phoneNumber: string): Promise<ActasState | null> {
  const path = `${DRAFTS_COLLECTION}/${phoneNumber}`;
  try {
    const docRef = doc(db, DRAFTS_COLLECTION, phoneNumber);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.stateJson) {
        return JSON.parse(data.stateJson) as ActasState;
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Guarda el estado del borrador de actas de un agente en Firebase.
 */
export async function saveUserDraft(phoneNumber: string, state: ActasState) {
  const path = `${DRAFTS_COLLECTION}/${phoneNumber}`;
  try {
    const docRef = doc(db, DRAFTS_COLLECTION, phoneNumber);
    await setDoc(docRef, {
      phoneNumber,
      stateJson: JSON.stringify(state),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
