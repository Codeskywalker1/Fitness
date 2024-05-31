<template>
  <div class="container">
    <header v-if="isLocalAdmin === true" class="header">
      <navBarAdministrador />
    </header>
    <header v-else>
      <navBarUsuario />
    </header>
    <section class="info">
      <h1 v-if="usuario">Citas de {{ usuario.nombre }} {{ usuario.apellidoPaterno }} {{ usuario.apellidoMaterno }}</h1>
      <h1 v-else>No se selecciono ningun usuario</h1>
      <div>
        <h2 v-if="!modoModificar" class="titulo">Agendar Cita</h2>
        <h2 v-else class="titulo">Modificar Cita</h2>
      </div>
      <div class="box">
        <form @submit.prevent="agendarCita">
          <div>
            <label for="tipoCita" class="tituloform">Tipo de Cita:</label><br><br>
            <select v-model="tipoCita" id="tipoCita" class="sombreado" required>
              <option value="entrenador">Entrenador</option>
              <option value="medico">Médico</option>
            </select>
          </div> <br>
          <div>
            <label for="fechaCita" class="tituloform">Fecha de la Cita:</label> <br> <br>
            <Vue3Datepicker v-model="fechaCita" :typeable="true" class="sombreado" required />
          </div> <br>
          <div v-if="tipoCita && fechaCita">
            <label for="horaCita" class="tituloform">Hora de la Cita:</label><br><br>
            <select v-if="horasDisponibles.length" v-model="horaCita" id="horaCita" class="sombreado" required>
              <option v-for="hora in horasDisponibles" :key="hora" :value="hora">{{ hora }}</option>
            </select>
            <p v-else class="aviso">Ya no hay citas para este día</p>
          </div>
          <div class="button" v-if="horasDisponibles.length">
            <button class="boton2" type="submit">{{ modoModificar ? 'Modificar Cita' : 'Agendar Cita' }}</button>
          </div>
        </form>
      </div>
      <h3 class="titulo">Mis Citas</h3>
      <div v-for="(citas, tipo) in citasPorTipo" :key="tipo">
        <h4 class="tipo">{{ tipo }}</h4>
        <table class="tabla-citas">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cita, index) in citas" :key="index">
              <td>{{ cita.fecha }}</td>
              <td>{{ cita.hora }}</td>
              <td>
                <button class="boton1" @click="cargarCita(tipo, cita)">Modificar Cita</button>
                <button class="boton1" @click="eliminarCita(tipo, cita)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <router-link to="/clientes">
        <button class="buttons__btn1">Regresar</button>
      </router-link>
    </section>
  </div>
</template>


<script>
import navBarUsuario from "@/components/navBarUsuario.vue";
import { useUserStore } from "../stores/user";
import navBarAdministrador from "@/components/navBarAdministrador.vue";
import Vue3Datepicker from "vue3-datepicker";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../Firebase/index";

export default {
  components: {
    navBarAdministrador,
    Vue3Datepicker,
    navBarUsuario,
  },
  data() {
    return {
      isLocalAdmin: false,
      selectedUserId: null,
      currentUserUID: null,
      tipoCita: "",
      fechaCita: null,
      horaCita: null,
      horarios: ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"],
      citasPorTipo: {},
      todasLasCitas: [],
      horasDisponibles: [],
      citaOriginal: null,
      modoModificar: false,
      usuario: null,
    };
  },
  methods: {
    async agendarCita() {
      try {
        let uidToUse = this.selectedUserId;
        if (this.isLocalAdmin === false) {
          uidToUse = this.currentUserUID;
        }

        if (!this.tipoCita || !this.fechaCita || !this.horaCita) {
          console.error("Por favor, seleccione el tipo de cita, la fecha y la hora.");
          return;
        }

        const fecha = this.fechaCita.toISOString().split('T')[0];
        const citaRef = doc(db, "citas", uidToUse);
        const citaDoc = await getDoc(citaRef);

        const nuevaCita = {
          tipo: this.tipoCita,
          hora: this.horaCita,
          nombre: this.usuario.nombre,
          apellidoPaterno: this.usuario.apellidoPaterno,
          apellidoMaterno: this.usuario.apellidoMaterno,
        };

        if (this.modoModificar && this.citaOriginal) {
          if (citaDoc.exists()) {
            const citas = citaDoc.data().citas || {};
            const fechaOriginal = this.citaOriginal.fecha;
            const horaOriginal = this.citaOriginal.hora;

            // Encuentra la cita original y actualiza los detalles
            if (citas[fechaOriginal]) {
              const citaIndex = citas[fechaOriginal].findIndex(c => c.hora === horaOriginal);
              if (citaIndex !== -1) {
                citas[fechaOriginal][citaIndex] = nuevaCita;
              }
            }

            await setDoc(citaRef, { citas }, { merge: true });
          }
          this.modoModificar = false;
          this.citaOriginal = null;
        } else {
          if (citaDoc.exists()) {
            const citas = citaDoc.data().citas || {};
            if (!citas[fecha]) {
              citas[fecha] = [];
            }
            citas[fecha].push(nuevaCita);
            await setDoc(citaRef, { citas }, { merge: true });
          } else {
            await setDoc(citaRef, { citas: { [fecha]: [nuevaCita] } });
          }
        }

        console.log("Cita agendada/modificada correctamente.");

        this.fechaCita = null;
        this.horaCita = null;
        this.tipoCita = "";
        this.mostrarCitas();
        this.cargarTodasLasCitas();
      } catch (error) {
        console.error("Error al agendar la cita:", error);
      }
    },
    async mostrarCitas() {
      try {
        let uidToUse = this.selectedUserId;
        if (this.isLocalAdmin === false) {
          uidToUse = this.currentUserUID;
        }

        const citaRef = doc(db, "citas", uidToUse);
        const citaDoc = await getDoc(citaRef);

        if (citaDoc.exists()) {
          const citas = citaDoc.data().citas || {};
          const citasPorTipo = {};

          for (const [fecha, citasEnFecha] of Object.entries(citas)) {
            for (const cita of citasEnFecha) {
              if (!citasPorTipo[cita.tipo]) {
                citasPorTipo[cita.tipo] = [];
              }
              citasPorTipo[cita.tipo].push({ fecha, hora: cita.hora });
            }
          }

          for (const tipo in citasPorTipo) {
            citasPorTipo[tipo].sort((a, b) => {
              if (a.fecha < b.fecha) return -1;
              if (a.fecha > b.fecha) return 1;
              if (a.hora < b.hora) return -1;
              if (a.hora > b.hora) return 1;
              return 0;
            });
          }

          const tiposOrdenados = Object.keys(citasPorTipo).sort((a, b) => {
            if (a === 'entrenador') return -1;
            if (b === 'entrenador') return 1;
            return 0;
          });

          const citasPorTipoOrdenadas = {};
          for (const tipo of tiposOrdenados) {
            citasPorTipoOrdenadas[tipo] = citasPorTipo[tipo];
          }

          this.citasPorTipo = citasPorTipoOrdenadas;
        } else {
          this.citasPorTipo = {};
        }
      } catch (error) {
        console.error("Error al mostrar las citas:", error);
      }
    },
    async cargarTodasLasCitas() {
      try {
        const citasSnapshot = await getDocs(collection(db, "citas"));
        const todasLasCitas = [];

        citasSnapshot.forEach((doc) => {
          const citas = doc.data().citas || {};
          for (const [fecha, citasEnFecha] of Object.entries(citas)) {
            for (const cita of citasEnFecha) {
              todasLasCitas.push({ tipo: cita.tipo, fecha, hora: cita.hora });
            }
          }
        });

        this.todasLasCitas = todasLasCitas;
        this.actualizarHorasDisponibles();
      } catch (error) {
        console.error("Error al cargar todas las citas:", error);
      }
    },
    actualizarHorasDisponibles() {
      if (!this.tipoCita || !this.fechaCita) {
        this.horasDisponibles = this.horarios;
        return;
      }

      const fecha = this.fechaCita.toISOString().split('T')[0];
      const citasEnFecha = this.todasLasCitas.filter(cita => cita.tipo === this.tipoCita && cita.fecha === fecha);

      const horasOcupadas = citasEnFecha.map(cita => cita.hora);
      this.horasDisponibles = this.horarios.filter(hora => !horasOcupadas.includes(hora));
    },
    async eliminarCita(tipo, cita, reload = true) {
      try {
        let uidToUse = this.selectedUserId;
        if (this.isLocalAdmin === false) {
          uidToUse = this.currentUserUID;
        }

        const citaRef = doc(db, "citas", uidToUse);
        const citaDoc = await getDoc(citaRef);

        if (citaDoc.exists()) {
          const citas = citaDoc.data().citas || {};
          const fecha = cita.fecha;

          if (citas[fecha]) {
            citas[fecha] = citas[fecha].filter(c => c.hora !== cita.hora);
            await setDoc(citaRef, { citas }, { merge: true });
            if (reload) {
              this.mostrarCitas();
              this.cargarTodasLasCitas();
            }
          }
        }
      } catch (error) {
        console.error("Error al eliminar la cita:", error);
      }
    },
    cargarCita(tipo, cita) {
      this.tipoCita = tipo;
      const [year, month, day] = cita.fecha.split('-');
      this.fechaCita = new Date(year, month - 1, day);
      this.horaCita = cita.hora;
      this.citaOriginal = { tipo, fecha: cita.fecha, hora: cita.hora };
      this.modoModificar = true;
    },
    async usuarioCargado() {
      try {
        let uidToUse = this.selectedUserId;
        if (this.isLocalAdmin === false) {
          uidToUse = this.currentUserUID;
        }

        const docRef = doc(db, "usuarios", uidToUse);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const usuario = docSnap.data();
          usuario.id = docSnap.id;
          this.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellidoPaterno: usuario.apellidoPaterno,
            apellidoMaterno: usuario.apellidoMaterno,
          };
          console.log("Usuario cargado:", this.usuario);
        } else {
          console.log("No existe el usuario con el ID especificado");
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    },
  },
  watch: {
    tipoCita() {
      this.actualizarHorasDisponibles();
    },
    fechaCita() {
      this.actualizarHorasDisponibles();
    }
  },
  beforeRouteEnter(to, from, next) {
    const userStore = useUserStore();
    const selectedUserId = userStore.selectedUserId;
    const isLocalAdmin = userStore.isAdmin;
    next((vm) => {
      vm.selectedUserId = selectedUserId;
      vm.isLocalAdmin = isLocalAdmin;
    });
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserUID = user.uid;
        this.mostrarCitas();
        this.usuarioCargado();
        this.cargarTodasLasCitas();
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

.section {
  padding: 20px;
}

.boton1 {
  margin-left: 3em;
  padding: 10px 20px;
  background: #3b46dd;
  color: white;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid #5e0f0f;
}

.boton1:hover {
  font-weight: bold;
  background-color: #150b50;
  color: #cde211;
  border: 1px solid #cde211;
}

.titulo {
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

.box {
  font-weight: bold;
  text-align: center;
  width: 350px;
  height: 375px;
  padding: 60px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  margin-bottom: 2em;
}

.info {
  margin-left: 2.5em;
  margin-right: 2.5em;
}

.tituloform {
  font-size: 1.5em;
  color: #f2f8f8;
}

.aviso {
  font-family: bold;
  font-size: 2em;
  color: red;
  font-style: italic;
}

.sombreado {
  text-align: center;
  background-color: #282828;
  color: white;
}

.tabla-citas {
  width: 90%;
  border-collapse: collapse;
  margin-bottom: 20px;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.tabla-citas th,
.tabla-citas td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.tabla-citas th:nth-child(3),
.tabla-citas td:nth-child(3) {
  text-align: center;
  width: 50em;
  /* Cambia este valor según tus necesidades */
}

.tabla-citas th {
  background-color: #030303;
}


.tabla-citas tr:nth-child(odd) {

  background-color: #007bff;
  /* Color azul para filas impares */
  color: white;
}

.tabla-citas tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.tipo {
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
