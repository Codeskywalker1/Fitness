<template>
  <div class="login">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div class="login__input">
        <input type="text" required v-model="email" />
        <label>Correo</label>
      </div>
      <div class="login__input">
        <input type="password" required v-model="password" />
        <label>Contraseña</label>
      </div>
      <div class="leyenda">
        <router-link to="/register">
          <p>¿No tienes usuario?, da click aqui!</p>
        </router-link>
      </div>
      <button class="buttons__btn login__submit" type="submit">Iniciar</button>
      <button class="buttons__btn return" @click="redirectToHome">Regresar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const email = ref("");
const password = ref("");
const router = useRouter();

const userStore = useUserStore();

const login = () => {
  userStore.login(email.value, password.value);
};

const redirectToHome = () => {
  router.push({ name: 'home' });
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

.login {
  margin: 300px auto;
  width: 500px;
  height: 375px;
  padding: 40px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.login h2 {
  margin-bottom: 30px;
  color: #fff;
  text-align: center;
}

.login .login__input {
  position: relative;
}

.login .login__input input {
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

.login .login__input label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  color: #fff;
  pointer-events: none;
  transition: 0.5s;
}

.login .login__input input:focus~label,
.login .login__input input:valid~label {
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

.login__submit:hover {
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

.leyenda a {
  text-decoration: none;
  /* Quitar subrayado */
  color: #ffffff;
  /* Cambiar color a rojo (cambia #ff0000 por el color que desees) */
}

/* Estilo para cambiar color al pasar el mouse por encima */
.leyenda a:hover {
  color: #00ff00;
  /* Cambiar color a verde al pasar el mouse por encima (cambia #00ff00 por el color que desees) */
}
</style>
