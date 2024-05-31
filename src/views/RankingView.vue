<template>
  <div class="container">
    <header v-if="isLocalAdmin === true" class="header">
      <navBarAdministrador />
    </header>
    <header v-else>
      <navBarUsuario />
    </header>
    <section class="info">
      <h2 id="titulo">Puntajes</h2>
      <div class="box">
        <ul>
          <li v-for="(usuario, index) in usuariosOrdenados" :key="usuario.uid"
            :style="{ color: currentUserUID === usuario.id ? 'red' : 'white' }">
            {{ index + 1 }}. {{ usuario.nombre }} - {{ usuario.puntaje }}
          </li>
        </ul>
      </div>
      <div>
        <router-link to="/">
          <button class="buttons__btn1">Regresar</button>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import navBarAdministrador from "@/components/navBarAdministrador.vue";
import navBarUsuario from "@/components/navBarUsuario.vue";
import { useUserStore } from "../stores/user";
import { db, auth } from "../Firebase/index";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      isLocalAdmin: false,
      currentUserUID: null,
      usuariosOrdenados: [],
    };
  },
  components: {
    navBarAdministrador,
    navBarUsuario,
  },
  methods: {
    async cargarUsuariosOrdenados() {
      try {
        const usuariosRef = collection(db, 'Ranking');
        const q = query(usuariosRef, orderBy('puntaje', 'desc'));
        const querySnapshot = await getDocs(q);
        const usuariosOrdenados = querySnapshot.docs.map(doc => doc.data());
        this.usuariosOrdenados = usuariosOrdenados;
      } catch (error) {
        console.error('Error al cargar los usuarios ordenados:', error);
      }
    },
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserUID = user.uid;
        console.log("El usuario actual es ", this.currentUserUID);
        this.cargarUsuariosOrdenados();
      }
    });
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.info {
  text-align: center;
  align-items: center;
  margin-top: 2em;
  margin-left: 2.5em;
  margin-right: 2.5em;
  /* Corrección: cambiar : por ; */
}

#titulo {
  font-size: 4em;
  font-weight: bold;
  background: #050505;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0px 3px 3px rgba(95, 68, 247, 0.836),
    0px -1px 1px rgba(0, 0, 0, 0.3);
  margin-bottom: 1em;
}

.box {
  font-weight: bold;
  text-align: center;
  width: 350px;
  height: 185px;
  padding: 60px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  margin-bottom: 2em;
  display: inline-block;
}

ul {
  list-style-type: none;
}

.info li {
  margin-bottom: 0.5em;
  font-size: 1.4em;
}

.buttons__btn1 {
  text-decoration: none;
  padding: 1em 2.5em;
  font-size: 1em;
  font-weight: bold;
  letter-spacing: 2px;
  color: #fff;
  background-color: #282828;
  border: none;
  border-radius: 35px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
  margin-top: 3em;
  margin-bottom: 2em;
}

.buttons__btn1:hover {
  background-color: #27ca89;
  color: #ffffff;
  box-shadow: 0px 15px 20px rgba(41, 207, 141, 0.4);
  transform: translateY(-7px);
  font-size: 0.9em;
}


@media (max-width: 1080px) {
  .container {
    padding: 0.5em;
  }

  .info {
    margin-left: 1em;
    margin-right: 1em;
  }

  .info li {
    font-size: 1em;
  }
}
</style>
