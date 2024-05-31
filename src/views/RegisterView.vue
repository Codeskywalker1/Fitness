<template>
  <div class="register">
    <h2>Registrarse</h2>
    <form @submit.prevent="register">
      <div class="register__input">
        <input type="email" required v-model="email" />
        <label>Correo</label>
      </div>
      <div class="register__input">
        <input type="password" required v-model="password" />
        <label>Contraseña</label>
      </div>
      <button class="buttons__btn register__submit" type="submit">Registrarse</button>
      <button class=" buttons__btn return" @click="redirectToHome">Regresar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { db } from "../Firebase/index";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const email = ref("");
const password = ref("");
const router = useRouter();
const isAdmin = ref(false);
const userStore = useUserStore(); //es necesario instanciar para usar nuestro estado

const register = async () => {
  console.log()
  try {

    // Actualizar isAdmin en la store
    userStore.setIsAdmin(isAdmin.value);
    console.log("dime si ya saliio", userStore.isAdmin);
    // Llamar al método de registro de usuario
    await userStore.register(email.value, password.value);

    // Obtener la instancia de autenticación de Firebase
    const auth = getAuth();

    // Obtener el usuario actualmente autenticado
    const userCredential = auth.currentUser;

    // Obtener el UID del usuario
    const uid = userCredential.uid;

    // Llamar al método de agregar usuario con el UID
    await agregarUsuario(uid, email.value, isAdmin.value);

  } catch (error) {
    console.error('Error al registrar usuario:', error);
  }
};

const agregarUsuario = async (uid, email, isAdmin) => {
  const userData = {
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
  };

  await setDoc(doc(db, "usuarios", uid), userData);
};

const redirectToHome = () => {
  router.push({ name: "home" });
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
  margin: 300px auto;
  width: 550px;
  height: 375px;
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

.register .register__input {
  position: relative;
}

.register .register__input input {
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

.register .register__input label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  color: #fff;
  pointer-events: none;
  transition: 0.5s;
}

.register .register__input input:focus~label,
.register .register__input input:valid~label {
  top: -20px;
  left: 0;
  color: #03e9f4;
  font-size: 12px;
}

.buttons__btn {
  margin-top: 2em;
  color: #d0dad0;
  margin-left: 1.5em;
  padding: 0.7em 1.7em;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(4, 70, 146, 0.308);
  background: #464646;
  transition: all 0.3s ease 0s;
  border: none;
  cursor: pointer;
  outline: none;
}

.register__submit:hover {
  background-color: #27ca89;
  color: #ffffff;
  box-shadow: 0px 15px 20px rgba(41, 207, 141, 0.4);
  transform: translateY(-7px);
}

.return:hover {
  background-color: #f53131;
  color: #ffffff;
  box-shadow: 0px 15px 20px rgba(229, 46, 46, 0.4);
  transform: translateY(-7px);
}
</style>
