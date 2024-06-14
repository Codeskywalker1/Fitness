<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <div class="info">
      <h1 id="titulo">Clientes</h1>
      <div class="seleccionado-info">
        <p>{{ clienteSeleccionado }}</p>
      </div>
      <div>
        <div class="button">
          <router-link to="/citas">
            <button class="buttons__btn1">Agendar</button>
          </router-link>
        </div>
        <div class="button">
          <router-link to="/asignarrutina">
            <button class="buttons__btn1">Rutina</button>
          </router-link>
        </div>
        <div class="button">
          <router-link to="/asignardieta">
            <button class="buttons__btn1">Dieta</button>
          </router-link>
        </div>
        <div class="button">
          <router-link to="/datos">
            <button class="buttons__btn1">Datos</button>
          </router-link>
        </div>
        <div class="button">
          <router-link to="/avances">
            <button class="buttons__btn1">Avance</button>
          </router-link>
        </div>
      </div>
      <div class="busqueda">
        <div class="input-container">
          <input class="buscar" type="text" v-model="busqueda" placeholder="Buscar cliente..." @input="buscarCliente" />
          <i class="fas fa-search"></i>
        </div>
      </div>

      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido Paterno</th>
            <th>Apellido Materno</th>
            <th>Correo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(usuario, index) in usuariosFiltrados" :key="index" @click="seleccionarCliente(usuario)" :class="{
            'fila-par': index % 2 === 0,
            'fila-impar': index % 2 !== 0,
          }">
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.apellidoPaterno }}</td>
            <td>{{ usuario.apellidoMaterno }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <button class="boton2" @click.stop="eliminarUsuario(usuario.id, usuario.email)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="buttons__btn buttons__btn--logout" @click.prevent="logout">
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../stores/user";
import { db } from "../Firebase/index";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth"; // Asegúrate de importar deleteUser
import navBarAdministrador from "@/components/navBarAdministrador.vue";

export default {
  data() {
    return {
      busqueda: "",
      clienteSeleccionado: null,
      usuarios: [],
    };
  },
  components: {
    navBarAdministrador,
  },
  computed: {
    usuariosFiltrados() {
      if (this.busqueda.length > 0) {
        return this.usuarios.filter((usuario) => {
          const busquedaMinuscula = this.busqueda.toLowerCase();
          return (
            usuario.nombre.toLowerCase().includes(busquedaMinuscula) ||
            usuario.apellidoPaterno.toLowerCase().includes(busquedaMinuscula) ||
            usuario.apellidoMaterno.toLowerCase().includes(busquedaMinuscula) ||
            usuario.email.toLowerCase().includes(busquedaMinuscula)
          );
        });
      } else {
        return this.usuarios;
      }
    },
  },
  methods: {
    seleccionarCliente(cliente) {
      this.clienteSeleccionado = `Cliente: ${cliente.nombre} ${cliente.apellidoPaterno} ${cliente.apellidoMaterno}, Correo: ${cliente.email}`;
      const userStore = useUserStore();
      userStore.selectedUserId = cliente.id; // Guarda la UID seleccionada en la store
      console.log("El UID es:", userStore.selectedUserId);
    },
    async cargarUsuarios() {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        this.usuarios = [];
        querySnapshot.forEach((doc) => {
          const usuario = doc.data();
          usuario.id = doc.id; // Agrega el ID del documento al objeto usuario
          this.usuarios.push(usuario);
          //console.log("Carga del usuario con ID", usuario.id);
        });
        // Ordenar los usuarios por nombre alfabéticamente
        this.usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre));
        console.log("usuarios cargados:", this.usuarios);
      } catch (error) {
        console.error("Error al cargar los usuarios:", error);
      }
    },
    async eliminarUsuario(uid, email) {
      try {
        const auth = getAuth();
        // Eliminar el usuario de Firestore
        await deleteDoc(doc(db, "usuarios", uid));

        // Eliminar el usuario de la autenticación
        //const user = await auth.getUserByEmail(email); // Obtén el usuario por correo electrónico
        //await deleteUser(user);

        // Volver a cargar la lista de usuarios
        await this.cargarUsuarios();

        console.log(`Usuario con UID: ${uid} y correo: ${email} eliminado exitosamente.`);
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    },
    logout() {
      const userStore = useUserStore();
      userStore.logout();
    },
  },
  mounted() {
    this.cargarUsuarios();
  },
};
</script>
<style>
/* Estilos para la tabla de usuarios */
.tabla-usuarios {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-usuarios th,
.tabla-usuarios td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.tabla-usuarios th {
  background-color: #030303;
}

.tabla-usuarios tr:nth-child(odd) {
  background-color: #007bff;
  /* Color azul para filas impares */
  color: white;
}

.tabla-usuarios tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.tabla-usuarios tr:hover {
  background-color: #1cd33a;
  color: #ffffff;
}

.buttons {
  display: flex;
  justify-content: space-evenly;
}

.buttons__btn {
  text-decoration: none;
  padding: 1.3em 3em;
  font-size: 14px;
  font-weight: bold;

  letter-spacing: 2px;
  color: #fff;
  background-color: #282828;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

.buttons__btn--logout:hover {
  background-color: #f53131;
  box-shadow: 0px 15px 20px rgba(229, 46, 46, 0.4);
  transform: translateY(-7px);
}

.buttons__btn:active {
  transform: translateY(-1px);
}

.header {
  margin-bottom: 30px;
}

#titulo {
  text-align: left;
  font-size: 4em;
  font-weight: bold;
  background: #050505;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0px 3px 3px rgba(95, 68, 247, 0.836),
    0px -1px 1px rgba(0, 0, 0, 0.3);
}

.seleccionado-info {
  font-weight: bold;
  font-size: 1.5em;
  background: linear-gradient(to right, rgb(221, 94, 137), rgb(247, 187, 151));
  text-decoration-line: underline;
  box-shadow: 0 15px 25px 5px rgb(221, 94, 137);
  margin-block-start: 20px;
  margin-block-end: 20px;
}

.button {
  display: inline-block;
  margin-top: 30px;
  margin-bottom: 20px;
}

.buttons__btn1 {
  margin-inline-end: 1.7em;
  text-decoration: none;
  padding: 1em 2.5em;
  font-size: 0.8em;
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
}

.buttons__btn1:hover {
  background-color: #27ca89;
  color: #ffffff;
  box-shadow: 0px 15px 20px rgba(41, 207, 141, 0.4);
  transform: translateY(-7px);
  font-size: 0.9em;
}

.busqueda {
  padding: 0.8em;
}

.buscar {
  font-size: 1.3em;
}

.info {
  margin-left: 2.5em;
  margin-right: 2.5em;
}

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
</style>
