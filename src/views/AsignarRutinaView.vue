<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <div class="info">
      <section>
        <div>
          <h1 v-if="usuario">Rutina para {{ usuario.nombre }} {{ usuario.apellidoPaterno }} {{ usuario.apellidoMaterno
            }}</h1>
          <h1 v-else>No se selecciono ningun usuario</h1>
          <h1 id="titulo">Ejercicios</h1>
        </div>
      </section>
      <div class="sections-container">
        <section class="section-left">
          <div class="box">
            <h2 class="tituloform">Ingresa la Fecha:</h2> <br>
            <vue3-datepicker class="sombreado" v-model="fechaSeleccionada" :typeable="true" />
            <form @submit.prevent="agregarRutina">
              <div>
                <button class="boton2" type="submit">Agregar Rutina</button>
              </div>
            </form>
          </div>
          <div>
            <div class="seleccionado-info">
              <p>Ejercicios seleccionados:</p>
              <ul>
                <li v-for="ejercicio in ejerciciosSeleccionados" :key="ejercicio.nombre">
                  {{ ejercicio.nombre }} ({{ ejercicio.grupoMuscular }})
                </li>
              </ul>
            </div>
            <div>
              <select v-model="filtroGruposMusculares" @change="filtrarEjercicios">
                <option value="">Filtrar por grupo muscular</option>
                <option v-for="grupoMuscular in gruposMusculares" :key="grupoMuscular" :value="grupoMuscular">{{
                  grupoMuscular }}</option>
              </select>
            </div>
            <div v-if="filtroGruposMusculares">
              <div class="busqueda">
                <div class="input-container">
                  <input class="buscar" type="text" v-model="busqueda" placeholder="Buscar ejercicio..."
                    @input="buscarEjercicio" />
                  <i class="fas fa-search"></i>
                </div>
              </div>
            </div>
          </div>
          <table class="tabla_ejercicios" v-if="filtroGruposMusculares">
            <div>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Grupo Muscular</th>
                  <th>Series</th>
                  <th>Repeticiones</th>
                  <th>Descanso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ejercicio, index) in ejerciciosFiltrados" :key="index" :class="{
                  'fila-par': index % 2 === 0,
                  'fila-impar': index % 2 !== 0,
                }">
                  <td>{{ ejercicio.nombre }}</td>
                  <td>{{ ejercicio.grupoMuscular }}</td>

                  <td>
                    <input type="text" v-model="ejercicio.series" />
                  </td>
                  <td>
                    <input type="text" v-model="ejercicio.repeticiones" />
                  </td>
                  <td>
                    <input type="text" v-model="ejercicio.descanso" />
                  </td>
                  <td>
                    <button class="boton2" @click="seleccionarEjercicio(ejercicio)">
                      {{ ejerciciosSeleccionados.find(e => e.nombre === ejercicio.nombre) ? 'Quitar' : 'Agregar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </div>
          </table>
        </section>
        <section class="section-right">
          <h1 id="titulo"> Rutina </h1>
          <table class="tabla_ejercicios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupo Muscular</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descanso</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody v-if="rutina">
              <tr v-for="ejercicio in rutina" :key="ejercicio.nombre">
                <td>{{ ejercicio.nombre }}</td>
                <td>{{ ejercicio.grupoMuscular }}</td>
                <td>{{ ejercicio.series }}</td>
                <td>{{ ejercicio.repeticiones }}</td>
                <td>{{ ejercicio.descanso }}</td>
                <td>
                  <button class="boton2" @click="eliminarEjercicio(ejercicio)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
      <div>
        <router-link to="/clientes">
          <button class="buttons__btn1">Regresar</button>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
import navBarAdministrador from "@/components/navBarAdministrador.vue";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useUserStore } from "../stores/user";
import { db } from "../Firebase/index"; // Asegúrate de importar auth de Firebase
import Vue3Datepicker from "vue3-datepicker";

export default {
  data() {
    return {
      busqueda: "",
      filtroGruposMusculares: "", // Valor inicial vacío
      isLocalAdmin: false,
      selectedUserId: null,
      ejerciciosSeleccionados: [],
      usuario: null,
      ejercicios: [],
      gruposMusculares: [],
      fechaSeleccionada: null, // Añade una nueva propiedad para almacenar la fecha seleccionada
      rutina: [], // Inicializar rutina como un array vacío
    };
  },
  components: {
    navBarAdministrador,
    Vue3Datepicker,
  },
  computed: {
    ejerciciosFiltrados() {
      let ejerciciosFiltrados = this.ejercicios;
      if (this.filtroGruposMusculares) {
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ejercicio => ejercicio.grupoMuscular === this.filtroGruposMusculares);
      }
      if (this.busqueda.length > 0) {
        const busquedaMinuscula = this.busqueda.toLowerCase();
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ejercicio =>
          ejercicio.nombre.toLowerCase().includes(busquedaMinuscula) ||
          ejercicio.grupoMuscular.toLowerCase().includes(busquedaMinuscula)
        );
      }
      return ejerciciosFiltrados;
    },
  },
  methods: {
    async eliminarEjercicio(ejercicio) {
      const fechaFormateada = this.fechaSeleccionada.toLocaleDateString("es-ES");
      const docRef = doc(db, "rutinas", this.selectedUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rutinas = docSnap.data();
        if (rutinas[fechaFormateada]) {
          delete rutinas[fechaFormateada][ejercicio.nombre]; // Elimina el ejercicio de la rutina
          await setDoc(docRef, rutinas); // Actualiza la rutina en la base de datos
          this.rutina = Object.keys(rutinas[fechaFormateada]).map(nombreEjercicio => {
            const ejercicio = rutinas[fechaFormateada][nombreEjercicio];
            return {
              nombre: nombreEjercicio,
              grupoMuscular: this.ejercicios.find(e => e.nombre === nombreEjercicio)?.grupoMuscular || '',
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              descanso: ejercicio.descanso
            };
          });
          console.log("Ejercicio eliminado de la rutina correctamente.");
        } else {
          console.error("No se encontró la rutina para la fecha seleccionada.");
        }
      } else {
        console.error("Error al recuperar la rutina del usuario:", this.selectedUserId);
      }
    },

    async mostrarRutina() {
      if (!this.fechaSeleccionada) {
        return; // No mostrar nada si no hay fecha seleccionada
      }

      const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
      const docRef = doc(db, 'rutinas', this.selectedUserId);
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
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              descanso: ejercicio.descanso
            };
          });
        } else {
          this.rutina = []; // No hay rutina para la fecha seleccionada
        }
      } else {
        console.error('Error al recuperar la rutina del usuario:', this.selectedUserId);
      }
    },
    async agregarRutina() {
      try {
        const docRef = doc(db, "rutinas", this.selectedUserId);
        const docSnap = await getDoc(docRef);
        let rutinas = {};

        if (docSnap.exists()) {
          rutinas = docSnap.data() || {};
        }
        // Obtener la fecha en formato "dd-mm-yyyy"
        const fechaFormateada = this.fechaSeleccionada.toLocaleDateString("es-ES");
        // Crear un objeto para almacenar los ejercicios seleccionados
        const ejerciciosRutina = {};

        this.ejerciciosSeleccionados.forEach((ejercicio) => {
          ejerciciosRutina[ejercicio.nombre] = {
            ...ejercicio, // Concatena las propiedades del ejercicio original
            series: ejercicio.series,
            repeticiones: ejercicio.repeticiones,
            descanso: ejercicio.descanso,
            ejercicioRealizado: false,
          };
        });

        // Asignar los ejercicios a la fecha correspondiente en el objeto rutinas
        rutinas[fechaFormateada] = ejerciciosRutina;

        await setDoc(docRef, rutinas, { merge: true });

        // Limpiar los campos del formulario
        this.fechaSeleccionada = null;
        this.ejerciciosSeleccionados = [];

        console.log("Fecha agregada a la rutina correctamente.");
      } catch (error) {
        console.error("Error al agregar la fecha:", error);
      }

    },
    seleccionarEjercicio(ejercicio) {
      const index = this.ejerciciosSeleccionados.findIndex(e => e.nombre === ejercicio.nombre);
      if (index !== -1) {
        // Si el ejercicio ya está seleccionado, eliminarlo
        this.ejerciciosSeleccionados.splice(index, 1);
      } else {
        // Si el ejercicio no está seleccionado, agregarlo
        this.ejerciciosSeleccionados.push(ejercicio);
      }
    },
    filtrarEjercicios() {
      if (!this.filtroGruposMusculares) {
        return [];
      }

      let ejerciciosFiltrados = this.ejercicios.filter(ejercicio => ejercicio.grupoMuscular === this.filtroGruposMusculares);

      if (this.busqueda.length > 0) {
        const busquedaMinuscula = this.busqueda.toLowerCase();
        ejerciciosFiltrados = ejerciciosFiltrados.filter(ejercicio =>
          ejercicio.nombre.toLowerCase().includes(busquedaMinuscula) ||
          ejercicio.grupoMuscular.toLowerCase().includes(busquedaMinuscula)
        );
      }

      return ejerciciosFiltrados;
    },
    async usuarioCargado() {
      try {
        console.log(`Se selecciono al usuario: ${this.selectedUserId}`);
        const docRef = doc(db, "usuarios", this.selectedUserId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const usuario = docSnap.data();
          usuario.id = docSnap.id; // Agrega el ID del documento al objeto usuario
          this.usuario = usuario;
          console.log("Usuario cargado:", this.usuario);
        } else {
          console.log("No existe el usuario con el ID especificado");
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    },
    async ejerciciosCargado() {
      try {
        const querySnapshot = await getDocs(collection(db, "ejercicios"));
        this.ejercicios = [];
        this.gruposMusculares = []; // Reinicializar la lista de Grupos Musculares
        querySnapshot.forEach((doc) => {
          const ejercicio = doc.data();
          this.ejercicios.push(ejercicio);
          if (!this.gruposMusculares.includes(ejercicio.grupoMuscular)) {
            this.gruposMusculares.push(ejercicio.grupoMuscular); // Agregar grupo muscular si no existe en la lista
          }
        });
        this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
        console.log("Ejercicios cargados:", this.ejercicios);
        console.log("Grupos Musculares de ejercicio:", this.gruposMusculares);
      } catch (error) {
        console.error("Error al cargar los ejercicios:", error);
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    console.clear();
    const userStore = useUserStore();
    const selectedUserId = userStore.selectedUserId;
    const isLocalAdmin = userStore.isAdmin;
    //console.log(`Se selecciono al usuario: ${selectedUserId}`);
    console.log(`isAdmin dentro del before es: ${userStore.isAdmin}`);
    next((vm) => {
      vm.selectedUserId = selectedUserId; // Asigna el ID del usuario seleccionado a la variable local
      vm.isLocalAdmin = isLocalAdmin;
    });
  },
  mounted() {
    this.usuarioCargado();
    this.ejerciciosCargado();
  },
  watch: {
    fechaSeleccionada() {
      this.mostrarRutina(); // Mostrar rutina al cambiar la fecha seleccionada
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

.sections-container {
  display: flex;
  flex: 1;
}

.section-left,
.section-right {
  width: 50%;
  padding: 20px;
  box-sizing: border-box;
}

.section-left {
  border-right: 1px solid #ccc;
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

ul {
  list-style-type: none;
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
  /* Color azul para filas impares */
  color: white;
}

.tabla_ejercicios tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.box {
  font-weight: bold;
  text-align: center;
  width: 350px;
  height: 225px;
  padding: 60px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  margin-bottom: 2em;
}

.section-right {
  margin-top: 1em;
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

.info {
  margin-left: 1.5em;
  margin-right: 1.5em;
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
