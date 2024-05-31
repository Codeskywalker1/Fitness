<template>
  <div class="container">
    <header class="header">
      <navBarUsuario />
    </header>
    <section class="info">
      <div>
        <h1 id="titulo"> Rutina </h1>
        <div class="box">
          <h2 class="tituloform">Ingresa la Fecha</h2><br><br>
          <vue3-datepicker class="sombreado" v-model="fechaSeleccionada" :typeable="true" />
        </div>
        <div class="cajaBoton">
          <router-link to="/">
            <button class="buttons__btn1">Regresar</button>
          </router-link>
        </div>
      </div>
      <div v-if="rutinaRealizada === false">
        <form @submit.prevent="handleSubmit">
          <table class="tabla_ejercicios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupo Muscular</th>
                <th>Ejemplo</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descanso</th>
                <th>Realizado</th>
              </tr>
            </thead>
            <tbody v-if="rutina.length">
              <tr v-for="ejercicio in rutina" :key="ejercicio.nombre">
                <td>{{ ejercicio.nombre }}</td>
                <td>{{ ejercicio.grupoMuscular }}</td>
                <td>
                  <img :src="ejercicio.imagenURL" alt="Imagen del ejercicio"
                    style="max-width: 100px; max-height: 100px" />
                </td>
                <td>{{ ejercicio.series }}</td>
                <td>{{ ejercicio.repeticiones }}</td>
                <td>{{ ejercicio.descanso }}</td>
                <td>
                  <input type="checkbox" :id="'ejercicioRealizado-' + ejercicio.nombre"
                    :name="'ejercicioRealizado-' + ejercicio.nombre" v-model="ejerciciosRealizados[ejercicio.nombre]"
                    @change="checkAllEjerciciosRealizados">
                </td>
              </tr>
            </tbody>
          </table>
          <button class="boton2" type="submit" :disabled="!rutina.length || !todosEjerciciosRealizados">Rutina
            Realizada</button>
        </form>
      </div>
      <div class="aviso" v-else-if="rutinaRealizada === true">
        <p>Se realizó la rutina</p>
      </div>
      <div v-else>
        <p>No hay rutina</p>
      </div>
    </section>
  </div>
</template>

<script>
import navBarUsuario from "@/components/navBarUsuario.vue";
import Vue3Datepicker from "vue3-datepicker";
import { useUserStore } from "../stores/user";
import { db, auth } from "../Firebase/index";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default {
  data() {
    return {
      ejercicios: [],
      isLocalAdmin: false,
      currentUserUID: null,
      fechaSeleccionada: null,
      rutina: [],
      ejerciciosRealizados: {},
      rutinaRealizada: false,
      usuario: null,
    };
  },
  computed: {
    todosEjerciciosRealizados() {
      return this.rutina.length && Object.values(this.ejerciciosRealizados).every(value => value);
    }
  },
  components: {
    navBarUsuario,
    Vue3Datepicker,
  },
  methods: {
    async actualizarRanking() {
      try {
        const docRef = doc(db, 'Ranking', this.currentUserUID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const puntajeActual = data.puntaje || 0;
          const nuevoPuntaje = puntajeActual + 10;

          await setDoc(docRef, {
            nombre: this.usuario.nombre,
            puntaje: nuevoPuntaje,
            id: this.currentUserUID,
          });

          console.log('Puntaje actualizado correctamente');
        } else {
          console.log('No se encontró un documento de ranking para el usuario actual. Creando uno nuevo...');

          await setDoc(docRef, {
            nombre: this.usuario.nombre,
            puntaje: 10,
            id: this.currentUserUID,
          });

          console.log('Documento de ranking creado correctamente');
        }
      } catch (error) {
        console.error('Error al actualizar el puntaje:', error);
      }
    },

    async usuarioCargado() {
      try {
        const docRef = doc(db, "usuarios", this.currentUserUID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const usuario = docSnap.data();
          usuario.id = docSnap.id;
          this.usuario = usuario;
          console.log("Usuario cargado:", this.usuario);
        } else {
          console.log("No existe el usuario con el ID especificado");
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    },
    async handleSubmit() {
      this.rutina.forEach(ejercicio => {
        this.ejerciciosRealizados[ejercicio.nombre] = true;
      });

      const docRef = doc(db, 'rutinas', this.currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rutinas = docSnap.data();
        const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
        if (rutinas[fechaFormateada]) {
          Object.keys(rutinas[fechaFormateada]).forEach(ejercicio => {
            rutinas[fechaFormateada][ejercicio].ejercicioRealizado = this.ejerciciosRealizados[ejercicio] || false;
          });

          await setDoc(docRef, rutinas);
          console.log('Rutina guardada con éxito');
        } else {
          console.error('No hay rutina para la fecha seleccionada');
        }
      } else {
        console.error('Error al recuperar la rutina del usuario:', this.currentUserUID);
      }
      await this.actualizarRanking();
      window.location.reload();
    },

    async mostrarRutina() {
      if (!this.fechaSeleccionada) {
        return;
      }

      const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
      const docRef = doc(db, 'rutinas', this.currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rutinas = docSnap.data();
        if (rutinas[fechaFormateada]) {
          const rutinaDelDia = rutinas[fechaFormateada];
          this.rutina = Object.keys(rutinaDelDia).map(nombreEjercicio => {
            const ejercicio = rutinaDelDia[nombreEjercicio];
            return {
              nombre: nombreEjercicio,
              grupoMuscular: ejercicio.grupoMuscular,
              imagenURL: ejercicio.imagenURL,
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              descanso: ejercicio.descanso,
              ejercicioRealizado: ejercicio.ejercicioRealizado,
            };
          });
          this.ejerciciosRealizados = this.rutina.reduce((acc, ejercicio) => {
            acc[ejercicio.nombre] = ejercicio.ejercicioRealizado || false;
            return acc;
          }, {});
          this.rutinaRealizada = this.rutina.every(ejercicio => ejercicio.ejercicioRealizado);
        } else {
          this.rutina = [];
          this.ejerciciosRealizados = {};
        }
      } else {
        console.error('Error al recuperar la rutina del usuario:', this.currentUserUID);
      }
    },
    checkAllEjerciciosRealizados() {
      this.$forceUpdate();
    },
  },

  beforeRouteEnter(to, from, next) {
    const userStore = useUserStore();
    const isLocalAdmin = userStore.isAdmin;
    console.log(`isAdmin dentro del before es: ${userStore.isAdmin}`);
    next((vm) => {
      vm.isLocalAdmin = isLocalAdmin;
    });
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserUID = user.uid;
        console.log("El usuario actual es ", this.currentUserUID);
        this.usuarioCargado();
      }
    });
  },
  watch: {
    fechaSeleccionada() {
      this.mostrarRutina();
    }
  },
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

.tabla_ejercicios {
  text-align: center;
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla_ejercicios input {
  max-width: 7ch;
}

.tabla_ejercicios td,
.tabla_ejercicios th {
  max-width: 20ch;
  border: 1px solid #ddd;
  padding: 8px;
}

.tabla_ejercicios th {
  background-color: #030303;
}

.tabla_ejercicios tr:nth-child(odd) {
  background-color: #007bff;
  color: white;
}

.tabla_ejercicios tr:nth-child(even) {
  background-color: #cceeff;
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

.info {
  margin-top: 2em;
  margin-left: 2.5em;
  margin-right: 2.5em;
}

.sombreado {
  text-align: center;
  background-color: #282828;
  color: white;
}

.tituloform {
  font-size: 1.5em;
  color: #f2f8f8;
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

.boton2 {
  margin-bottom: 2em;
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

.boton2:disabled {
  /* Estilos para el botón deshabilitado */
  opacity: 0.5;
  cursor: not-allowed;
}

.buttons__btn1 {
  display: inline-block;
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

.cajaBoton {
  margin-left: 10em;
  display: inline-block;
}

.aviso {
  font-family: bold;
  font-size: 2em;
  color: red;
  font-style: italic;
}
</style>
