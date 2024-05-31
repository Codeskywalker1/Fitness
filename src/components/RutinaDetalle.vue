<template>
  <div class="container">
    <header class="header">
      <navBarUsuario />
    </header>
    <section class="info">
      <div>
        <h2>Rutina</h2><br><br>
        <form @submit.prevent="handleSubmit">
          <table class="tabla_ejercicios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupo Muscular</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descanso</th>
                <th>Realizado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ejercicio, index) in rutina" :key="index">
                <td>{{ ejercicio.nombre }}</td>
                <td>{{ ejercicio.grupoMuscular }}</td>
                <td>{{ ejercicio.series }}</td>
                <td>{{ ejercicio.repeticiones }}</td>
                <td>{{ ejercicio.descanso }}</td>
                <td>
                  <input type="checkbox" v-model="ejercicio.realizado" />
                </td>
              </tr>
            </tbody>
          </table>
          <button class="boton2" type="submit">Rutina Realizada</button>
        </form>
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
import navBarUsuario from "@/components/navBarUsuario.vue";
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      rutina: this.getRutinaPorId(this.id)
    };
  },
  components: {
    navBarUsuario,
  },
  methods: {
    getRutinaPorId(id) {
      const rutinas = {
        "0": [
          { nombre: "Press con mancuernas", grupoMuscular: "Pectoral", imagenURL: "/path/to/image1.jpg", series: 3, repeticiones: 12, descanso: "1 min", realizado: false },
          { nombre: "Dominadas", grupoMuscular: "Espalda", imagenURL: "/path/to/image2.jpg", series: 4, repeticiones: 10, descanso: "1 min", realizado: false }
        ],
        "1": [
          { nombre: "Sentadillas", grupoMuscular: "Piernas", imagenURL: "/path/to/image3.jpg", series: 4, repeticiones: 15, descanso: "1 min", realizado: false },
          { nombre: "Peso muerto", grupoMuscular: "Espalda baja", imagenURL: "/path/to/image4.jpg", series: 3, repeticiones: 12, descanso: "1 min", realizado: false }
        ],
        "2": [
          { nombre: "Flexiones", grupoMuscular: "Pectoral", imagenURL: "/path/to/image5.jpg", series: 4, repeticiones: 20, descanso: "1 min", realizado: false },
          { nombre: "Fondos", grupoMuscular: "Tríceps", imagenURL: "/path/to/image6.jpg", series: 3, repeticiones: 15, descanso: "1 min", realizado: false }
        ],
        "3": [
          { nombre: "Curl de bíceps", grupoMuscular: "Bíceps", imagenURL: "/path/to/image7.jpg", series: 3, repeticiones: 12, descanso: "1 min", realizado: false },
          { nombre: "Elevaciones laterales", grupoMuscular: "Hombros", imagenURL: "/path/to/image8.jpg", series: 4, repeticiones: 12, descanso: "1 min", realizado: false }
        ]
      };
      return rutinas[id] || [];
    },
    handleSubmit() {
      this.rutina.forEach(ejercicio => {
        ejercicio.realizado = true;
      });
      alert("Rutina realizada!");
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.info {
  margin-top: 2em;
  margin-left: 2.5em;
  margin-right: 2.5em;
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

.boton2 {
  margin-bottom: 2em;
  padding: 10px 20px;
  background: #3b46dd;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}
</style>
