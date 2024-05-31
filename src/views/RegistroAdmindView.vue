<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <div class="register">
      <h2>Registro</h2>
      <form @submit.prevent="register">
        <div class="register__input">
          <input type="email" required v-model="email" />
          <label>Email</label>
        </div>
        <div class="register__input">
          <input type="password" required v-model="password" />
          <label>Password</label>
        </div>
        <div id="check" class="register__input">
          <label for="isAdmin">Asignar como administrador?</label>
          <input type="checkbox" id="isAdmin" v-model="isAdmin" />
        </div>
        <div class="botones">
          <button class="boton2" type="submit">Registrar</button>
          <button class="boton2" @click="redirectToHome">Regresar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import navBarAdministrador from "@/components/navBarAdministrador.vue";
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { db } from "../Firebase/index";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const email = ref('');
const password = ref('');
const isAdmin = ref(false);
const router = useRouter();
const userStore = useUserStore();

const register = async () => {
  try {
    // Llamar al método de registro de usuario
    await userStore.register(email.value, password.value);

    // Obtener la instancia de autenticación de Firebase
    const auth = getAuth();

    // Obtener el usuario actualmente autenticado
    const userCredential = await auth.currentUser;

    // Obtener el UID del usuario
    const uid = userCredential.uid;

    // Llamar al método de agregar usuario con el UID
    await agregarUsuario(uid, email.value, isAdmin.value);

  } catch (error) {
    console.error('Error al registrar usuario:', error);
  }
};

const agregarUsuario = async (uid, email, isAdmin) => {
  // Agregar el usuario a la colección "administradores" con el UID como ID del documento
  if (isAdmin) {
    await setDoc(doc(db, "administradores", uid), {
      email,
      isAdmin,
    });
  } else {
    await setDoc(doc(db, "usuarios", uid), {
      email,
    isAdmin,
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: null,
    edad: 0,
    estadoCivil: "",
    domicilio: "",
    deporte: "",
    objetivo: "",
    diasEntrenamiento: 0,
    tiempoPorDiaEntrenamiento: 0,
    antiguedadEntrenamiento: 0,
    tipoEntrenamiento: "",
    peso: 0,
    estatura: 0,
    circunferenciaAbdominal: 0,
    circunferenciaCadera: 0,
    alimentosFavoritos: "",
    alimentosDisgutan: "",
    alimentosAlergico: "",
    antecedentesMedicos: "",
    antecedentesPatologicos: "",
    datos: false,
  });
  }
};

const redirectToHome = () => {
  router.push({ name: 'clientes' });
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

@media (max-width: 1080px) {
  .sections-container {
    flex-direction: column;
  }

  .section-left,
  .section-right {
    width: 100%;
    border-right: none;
  }
}

.register {
  margin: 100px auto;
  width: 550px;
  padding: 40px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.register h2 {
  margin-bottom: 30px;
  color: #fff;
  text-align: center;
}

.register__input {
  position: relative;
  display: flex;
  align-items: center;
}

.register__input input {
  font-size: 18px;
  width: 100%;
  padding: 10px 0;
  color: #fff;
  margin-bottom: 30px;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  background: transparent;
}

.register__input label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  color: #fff;
  pointer-events: none;
  transition: 0.5s;
}

.register__input input:focus~label,
.register__input input:valid~label {
  top: -20px;
  left: 0;
  color: #03e9f4;
  font-size: 12px;
}

.register__input input[type="checkbox"] {
  margin-top: 5%;
  margin-left: 50%;
}

.boton2 {
  padding: 10px 20px;
  background: #3b46dd;
  color: white;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid #5e0f0f;
}

.boton2:hover {
  font-weight: bold;
  background-color: #150b50;
  color: #cde211;
  border: 1px solid #cde211;
}

.botones {
  display: flex;
  justify-content: space-between;
}
</style>
