<template>
  <div class="container">
    <header v-if="isLocalAdmin === true" class="header">
      <navBarAdministrador />
    </header>
    <header v-else>
      <navBarUsuario />
    </header>
    <div class="info">
      <section>
        <div class="chart-container"><div>
            <h2 id="titulo">Gráfica de Peso</h2>
          </div>
          <div>
            <canvas v-if="chartData" ref="chartCanvasPeso"></canvas>
          </div>
        </div>
        <div class="chart-container">
          <div>
            <h2 id="titulo">Gráfica de Circunferencia Abdominal</h2>
          </div>
          <div>
            <canvas v-if="chartData" ref="chartCanvasAbdominal"></canvas>
          </div>
          
        </div>
        <div class="chart-container">
          <div>
            <h2 id="titulo">Gráfica de Circunferencia Cadera</h2>
          </div>
          <div>
            <canvas v-if="chartData" ref="chartCanvasCadera"></canvas>
          </div>
          
        </div>
        <div class="data-list">
          <h3 id="titulo2">Entradas de Peso y Circunferencias</h3>
          <table class="tabla_datos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Peso (kg)</th>
                <th>Circunferencia Abdominal (cm)</th>
                <th>Circunferencia Cadera (cm)</th>
                <th v-if="isLocalAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, index) in avances" :key="index">
                <td>{{ entry.fecha }}</td>
                <td>{{ entry.peso }}</td>
                <td>{{ entry.circunferenciaAbdominal }}</td>
                <td>{{ entry.circunferenciaCadera }}</td>
                <td v-if="isLocalAdmin">
                  <button 
                    class="boton2" 
                    @click="eliminarEntrada(index)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <div>
        <div>
          <router-link to="/clientes">
            <button class="buttons__btn1">Regresar</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navBarUsuario from "@/components/navBarUsuario.vue";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';
import { db, auth } from "../Firebase/index";
import { useUserStore } from "../stores/user";
import { doc, getDoc, setDoc } from "firebase/firestore";
import navBarAdministrador from "@/components/navBarAdministrador.vue";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  components: {
    navBarAdministrador,
    navBarUsuario,
  },
  data() {
    return {
      chartData: null,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            ticks: {
              stepSize: 10,
            },
          },
        },
      },
      selectedUserId: null,
      isLocalAdmin: false,
      currentUserUID: null,
      chartInstancePeso: null,
      chartInstanceAbdominal: null,
      chartInstanceCadera: null,
      avances: [], // Array para almacenar las entradas de peso, circunferenciaAbdominal y circunferenciaCadera
    };
  },
  methods: {
    async eliminarEntrada(index) {
      console.log("Índice a eliminar:", index);
      try {
        let uidToUse = this.selectedUserId;
        if (!this.isLocalAdmin) {
          uidToUse = this.currentUserUID;
        }

        console.log("Documento a eliminar", uidToUse);
        const collectionName = "avances";
        const docRef = doc(db, collectionName, uidToUse);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Documento encontrado:", docSnap.data());

          const data = docSnap.data();
          const updatedDataArray = Object.values(data);

          // Eliminar el elemento en el índice especificado
          console.log("Datos antes de eliminar:", updatedDataArray);
          updatedDataArray.splice(index, 1);

          // Convertir el array de nuevo a un objeto
          const newData = {};
          updatedDataArray.forEach((item, i) => {
            newData[i] = item;
          });

          console.log("Datos después de eliminar y reajustar índices:", newData);

          // Actualizar el documento en Firestore
          await setDoc(docRef, newData);

          // Recargar los datos
          this.cargarDatos();
        } else {
          console.log("No se encontró el documento.");
        }
      } catch (error) {
        console.error("Error eliminando la entrada: ", error);
      }
    },

    async cargarDatos() {
      try {
        let uidToUse = this.selectedUserId;
        if (!this.isLocalAdmin) {
          uidToUse = this.currentUserUID;
        }

        const collectionName = "avances";
        console.log(`Buscando en la colección ${collectionName}`);

        const docRef = doc(db, collectionName, uidToUse);
        console.log(`Buscando en el documento ${uidToUse}`);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          console.log("Se encontró la colección y el documento");

          const data = docSnap.data();
          this.avances = [];

          // Iterar sobre las claves del objeto data y extraer las fechas, pesos y circunferencias
          Object.keys(data).forEach((key) => {
            if (typeof data[key] === "object" && !Array.isArray(data[key])) {
              console.log(`Campo mapa encontrado: ${key}`, data[key]);
              this.avances.push({ index: key, ...data[key] });
            }
          });

          // Extraer las fechas y pesos de los campos mapa y mantener el orden original
          const labels = this.avances.map((entry) => entry.fecha);
          const weights = this.avances.map((entry) => parseFloat(entry.peso));
          const abdominalCircumferences = this.avances.map((entry) => parseFloat(entry.circunferenciaAbdominal));
          const hipCircumferences = this.avances.map((entry) => parseFloat(entry.circunferenciaCadera));

          console.log("Valores en el eje X (fechas):", labels);
          console.log("Valores en el eje Y (pesos):", weights);
          console.log("Valores en el eje Y (circunferencia abdominal):", abdominalCircumferences);
          console.log("Valores en el eje Y (circunferencia cadera):", hipCircumferences);

          this.chartData = {
            labels: labels,
            datasets: [
              {
                label: "Peso",
                data: weights,
                fill: false,
                borderColor: "rgba(75,192,192,1)",
              },
              {
                label: "Circunferencia Abdominal",
                data: abdominalCircumferences,
                fill: false,
                borderColor: "rgba(192,75,75,1)",
              },
              {
                label: "Circunferencia Cadera",
                data: hipCircumferences,
                fill: false,
                borderColor: "rgba(75,75,192,1)",
              },
            ],
          };
          this.renderChart();
        } else {
          console.log("No se encontró el documento para el usuario especificado");
          console.log(this.selectedUserId);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    },

    renderChart() {
      this.$nextTick(() => {
        if (this.$refs.chartCanvasPeso) {
          if (this.chartInstancePeso) {
            this.chartInstancePeso.destroy();
          }
          const ctxPeso = this.$refs.chartCanvasPeso.getContext("2d");
          this.chartInstancePeso = new ChartJS(ctxPeso, {
            type: "line",
            data: {
              labels: this.chartData.labels,
              datasets: [
                {
                  label: "Peso",
                  data: this.chartData.datasets[0].data,
                  fill: false,
                  borderColor: "rgba(75,192,192,1)",
                },
              ],
            },
            options: this.chartOptions,
          });
        }

        if (this.$refs.chartCanvasAbdominal) {
          if (this.chartInstanceAbdominal) {
            this.chartInstanceAbdominal.destroy();
          }
          const ctxAbdominal = this.$refs.chartCanvasAbdominal.getContext("2d");
          this.chartInstanceAbdominal = new ChartJS(ctxAbdominal, {
            type: "line",
            data: {
              labels: this.chartData.labels,
              datasets: [
                {
                  label: "Circunferencia Abdominal",
                  data: this.chartData.datasets[1].data,
                  fill: false,
                  borderColor: "rgba(192,75,75,1)",
                },
              ],
            },
            options: this.chartOptions,
          });
        }

        if (this.$refs.chartCanvasCadera) {
          if (this.chartInstanceCadera) {
            this.chartInstanceCadera.destroy();
          }
          const ctxCadera = this.$refs.chartCanvasCadera.getContext("2d");
          this.chartInstanceCadera = new ChartJS(ctxCadera, {
            type: "line",
            data: {
              labels: this.chartData.labels,
              datasets: [
                {
                  label: "Circunferencia Cadera",
                  data: this.chartData.datasets[2].data,
                  fill: false,
                  borderColor: "rgba(75,75,192,1)",
                },
              ],
            },
            options: this.chartOptions,
          });
        }
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    const userStore = useUserStore();
    const selectedUserId = userStore.selectedUserId;
    const isLocalAdmin = userStore.isAdmin;
    console.log(`Se selecciono al usuario: ${selectedUserId}`);
    console.log(`isAdmin dentro del before es: ${userStore.isAdmin}`);
    next((vm) => {
      vm.selectedUserId = selectedUserId;
      vm.isLocalAdmin = isLocalAdmin;
    });
  },
  mounted() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserUID = user.uid;
        console.log("El usuario actual es ", this.currentUserUID);
        this.cargarDatos();
      }
    });
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.section {
  padding: 20px;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 900px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr:hover {
  background-color: #f5f5f5;
}

.buttons__btn1 {
  margin-top: 8em;
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

.tabla_datos {
  text-align: center;
  width: 30%;
  border-collapse: collapse;
  margin-bottom: 20px;
}


.tabla_datos input {
  max-width: 7ch;
}

.tabla_datos td,
.tabla_datos th {
  text-align: center;
  max-width: 20ch;
  border: 1px solid #ddd;
  padding: 8px;
}

.tabla_datos th {
  background-color: #030303;
}



.tabla_datos tr:nth-child(odd) {
  background-color: #007bff;
  /* Color azul para filas impares */
  color: white;
}

.tabla_datos tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.info {
  margin-left: 1.5em;
  margin-right: 1.5em;
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

#titulo2 {
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
