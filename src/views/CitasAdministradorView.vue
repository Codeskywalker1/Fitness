<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <section class="info">
      <h3 id="titulo">Citas</h3>
      <div class="box">
        <h4 class="tituloform">Ingresa la Fecha</h4> <br>
        <vue3-datepicker class="sombreado" v-model="fechaSeleccionada" :typeable="true" /> <br>
        <select class="sombreado" v-model="tipoCita" id="tipoCita">
          <option value="">Todas</option>
          <option value="entrenador">Entrenador</option>
          <option value="medico">Médico</option>
        </select>
      </div>
      <div v-if="citasFiltradas.length > 0" class="tablas-citas">
        <div class="tabla-cita">
          <h4 class="titulo2">Citas con Entrenador</h4>
          <table class="tabla_citas" v-if="citasFiltradasEntrenador.length > 0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cita in citasFiltradasEntrenador" :key="cita.fecha + cita.hora + cita.tipo">
                <td>{{ cita.fecha }}</td>
                <td>{{ cita.hora }}</td>
                <td>{{ cita.nombre }}</td>
                <td>{{ cita.apellidoPaterno }}</td>
                <td>{{ cita.apellidoMaterno }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mensaje" v-else>No hay citas con entrenador este día</p>
        </div>

        <div class="tabla-cita">
          <h4 class="titulo2">Citas con Médico</h4>
          <table class="tabla_citas" v-if="citasFiltradasMedico.length > 0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cita in citasFiltradasMedico" :key="cita.fecha + cita.hora + cita.tipo">
                <td>{{ cita.fecha }}</td>
                <td>{{ cita.hora }}</td>
                <td>{{ cita.nombre }}</td>
                <td>{{ cita.apellidoPaterno }}</td>
                <td>{{ cita.apellidoMaterno }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mensaje" v-else>No hay citas con médico este día</p>
        </div>
      </div>
      <p class="mensaje" v-else>No hay citas este día</p>
      <router-link to="/clientes">
        <button class="buttons__btn1">Regresar</button>
      </router-link>
    </section>


  </div>
</template>


<script>
import navBarAdministrador from "@/components/navBarAdministrador.vue";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/index";
import Vue3Datepicker from "vue3-datepicker";

export default {
  data() {
    return {
      fechaSeleccionada: null,
      tipoCita: "",
      citas: [],
      citasFiltradas: [],
    };
  },
  components: {
    navBarAdministrador,
    Vue3Datepicker,
  },
  methods: {
    async cargarCitas() {
      try {
        const citasSnapshot = await getDocs(collection(db, "citas"));
        const citas = [];

        for (const docSnap of citasSnapshot.docs) {
          const data = docSnap.data().citas || {};
          for (const [fecha, citasEnFecha] of Object.entries(data)) {
            for (const cita of citasEnFecha) {
              const userRef = doc(db, "usuarios", docSnap.id);
              const userSnap = await getDoc(userRef);
              const usuario = userSnap.exists() ? userSnap.data() : {};

              citas.push({
                fecha,
                tipo: cita.tipo,
                hora: cita.hora,
                nombre: usuario.nombre || '',
                apellidoPaterno: usuario.apellidoPaterno || '',
                apellidoMaterno: usuario.apellidoMaterno || '',
              });
            }
          }
        }

        this.citas = citas;
        this.filtrarCitas();
      } catch (error) {
        console.error("Error al cargar las citas:", error);
      }
    },

    filtrarCitas() {
      const fechaSeleccionada = this.fechaSeleccionada ? this.fechaSeleccionada.toISOString().split('T')[0] : null;

      this.citasFiltradas = this.citas.filter(cita => {
        const matchFecha = fechaSeleccionada ? cita.fecha === fechaSeleccionada : true;
        const matchTipo = this.tipoCita ? cita.tipo === this.tipoCita : true;
        return matchFecha && matchTipo;
      });
    },
  },
  computed: {
    citasFiltradasEntrenador() {
      return this.citasFiltradas.filter(cita => cita.tipo === 'entrenador');
    },
    citasFiltradasMedico() {
      return this.citasFiltradas.filter(cita => cita.tipo === 'medico');
    }
  },
  watch: {
    fechaSeleccionada() {
      this.filtrarCitas();
    },
    tipoCita() {
      this.filtrarCitas();
    },
  },
  mounted() {
    this.cargarCitas();
  },
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.section {
  padding: 20px;
}

.buttons__btn1 {
  margin-top: 2em;
  margin-bottom: 2em;
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
  margin-bottom: 0.5em;
}

.info {
  margin-top: 2.5em;
  margin-left: 5em;
}

.box {
  font-weight: bold;
  text-align: center;
  width: 350px;
  height: 220px;
  padding: 60px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  margin-bottom: 2em;
}

.tituloform {
  font-size: 1.5em;
  color: #f2f8f8;
}

.titulo2 {
  text-align: left;
  font-size: 2em;
  font-weight: bold;
  background: #050505;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0px 3px 3px rgba(12, 79, 95, 0.836),
    0px -1px 1px rgba(209, 15, 15, 0.3);
  margin-bottom: 0.5em;
}

.tabla_citas {
  text-align: center;
  width: 30%;
  border-collapse: collapse;
  margin-bottom: 20px;
}


.tabla_citas input {
  max-width: 7ch;
}

.tabla_citas td,
.tabla_citas th {
  text-align: center;
  max-width: 20ch;
  border: 1px solid #ddd;
  padding: 8px;
}

.tabla_citas th {
  background-color: #030303;
}



.tabla_citas tr:nth-child(odd) {
  background-color: #007bff;
  /* Color azul para filas impares */
  color: white;
}

.tabla_citas tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.mensaje {
  color: #e21b1b;
  text-align: left;
  font-size: 1.5em;
  font-weight: bold;
  background: #884747;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  margin-bottom: 0.5em;
  font-style: italic;
}

.sombreado {
  text-align: center;
  background-color: #282828;
  color: white;
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
