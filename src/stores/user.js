import { defineStore } from "pinia";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const useUserStore = defineStore("user", {
  state: () => {
    return {
      user: null,
      isAdmin:
        localStorage.getItem("isAdmin") === "true"
          ? true
          : localStorage.getItem("isAdmin") === "false"
          ? false
          : null,
      selectedUserId: null,
      rutinaSeleccionada: null,
      dietaSeleccionada: null,
    };
  },
  actions: {
    async register(email, password) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        switch (error.code) {
          case "auth/email-already-in-use":
            alert("Email already in use");
            break;
          case "auth/invalid-email":
            alert("Invalid email");
          default:
            break;
        }
        return;
      }
      this.user = auth.currentUser;
      this.$router.push("/");
    },
    async login(email, password) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        switch (error.code) {
          case "auth/user-not-found":
            alert("User not found");
            break;
          case "auth/wrong-password":
            alert("Wrong password");
            break;
          default:
            break;
        }
        return;
      }

      this.user = auth.currentUser;

      // Verifica si el usuario es administrador
      const adminDocRef = doc(db, "administradores", this.user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        //console.clear();
        this.isAdmin = true;
        localStorage.setItem("isAdmin", this.isAdmin);
        console.log("Usuario es administrador");
        this.$router.push("/clientes");
        console.log(`Soy guardo ${this.isAdmin}`);
        return;
      }

      // Si no es administrador, verifica si es un usuario normal
      const userDocRef = doc(db, "usuarios", this.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        //console.clear();
        this.isAdmin = false;
        localStorage.setItem("isAdmin", this.isAdmin);
        console.log("Usuario es normal");
        this.$router.push("/dashboard");
        console.log(`Soy guardo ${this.isAdmin}`);
        return;
      }

      // Si no se encuentra en ninguna colección, muestra un error
      console.error("User document not found");
    },
    async logout() {
      await signOut(auth);
      this.user = null;
      this.isAdmin = null;
      localStorage.removeItem("isAdmin"); // Elimina isAdmin de localStorage
      this.selectedUserId = null;
      this.$router.push("/");
    },
    // Nueva acción para guardar el índice de la rutina seleccionada
    setRutinaSeleccionada(index) {
      this.rutinaSeleccionada = index;
      console.log("se guardo la rutina: ", this.rutinaSeleccionada);
    },
    // Nueva acción para guardar el índice de la rutina seleccionada
    setDietaSeleccionada(index) {
      this.dietaSeleccionada = index;
      console.log("se guardo la dieta: ", this.dietaSeleccionada);
    },
    setIsAdmin(isAdmin) {
      this.isAdmin = isAdmin;
    },
  },
});
