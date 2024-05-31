<template>
  <div class="container">
    <header class="header">
      <navBarUsuario />
    </header>
    <section class="info">
      <div>
        <h2>Dieta</h2><br> <br>
        <form @submit.prevent="handleSubmit">
          <div v-for="(alimentos, tipo) in dietaPorTipo" :key="tipo">
            <h2>{{ tipo }}</h2>
            <table class="tabla_alimentos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Energia</th>
                  <th>Proteinas</th>
                  <th>Grasas</th>
                  <th>Hidratos de Carbono</th>
                  <th>Porciones</th>
                  <th>Completo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alimento in alimentos" :key="alimento.nombre">
                  <td>{{ alimento.nombre }}</td>
                  <td>{{ alimento.categoria }}</td>
                  <td>{{ alimento.energia }}</td>
                  <td>{{ alimento.proteinas }}</td>
                  <td>{{ alimento.grasas }}</td>
                  <td>{{ alimento.hidratosDeCarbono }}</td>
                  <td>{{ alimento.porciones }}</td>
                  <td>
                    <input type="checkbox" v-model="alimento.completo" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button class="boton2" type="submit">Dieta Completa</button>
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
      dietaPorTipo: this.getDietaPorId(this.id)
    };
  },
  components: {
    navBarUsuario,
  },
  methods: {
    getDietaPorId(id) {
      const dietas = {
        "0": {
          Desayuno: [
            { nombre: "Avena", categoria: "Cereal", imagenURL: "/path/to/image1.jpg", energia: "150 kcal", proteinas: "5g", grasas: "3g", hidratosDeCarbono: "27g", porciones: "1 taza", completo: false },
            { nombre: "Manzana", categoria: "Fruta", imagenURL: "/path/to/image2.jpg", energia: "95 kcal", proteinas: "0.5g", grasas: "0.3g", hidratosDeCarbono: "25g", porciones: "1 mediana", completo: false }
          ],
          Comida: [
            { nombre: "Pollo a la plancha", categoria: "Proteína", imagenURL: "/path/to/image3.jpg", energia: "200 kcal", proteinas: "30g", grasas: "5g", hidratosDeCarbono: "0g", porciones: "150g", completo: false },
            { nombre: "Arroz integral", categoria: "Cereal", imagenURL: "/path/to/image4.jpg", energia: "215 kcal", proteinas: "5g", grasas: "1.8g", hidratosDeCarbono: "45g", porciones: "1 taza", completo: false }
          ],
          Cena: [
            { nombre: "Ensalada mixta", categoria: "Verdura", imagenURL: "/path/to/image5.jpg", energia: "120 kcal", proteinas: "3g", grasas: "7g", hidratosDeCarbono: "12g", porciones: "1 plato", completo: false },
            { nombre: "Yogur natural", categoria: "Lácteo", imagenURL: "/path/to/image6.jpg", energia: "100 kcal", proteinas: "6g", grasas: "3.5g", hidratosDeCarbono: "10g", porciones: "1 taza", completo: false }
          ]
        },
        "1": {
          Desayuno: [
            { nombre: "Huevos revueltos", categoria: "Proteína", imagenURL: "/path/to/image7.jpg", energia: "140 kcal", proteinas: "12g", grasas: "10g", hidratosDeCarbono: "1g", porciones: "2 huevos", completo: false },
            { nombre: "Pan integral", categoria: "Cereal", imagenURL: "/path/to/image8.jpg", energia: "80 kcal", proteinas: "4g", grasas: "1g", hidratosDeCarbono: "15g", porciones: "1 rebanada", completo: false }
          ],
          Comida: [
            { nombre: "Pasta con tomate", categoria: "Cereal", imagenURL: "/path/to/image9.jpg", energia: "300 kcal", proteinas: "10g", grasas: "5g", hidratosDeCarbono: "50g", porciones: "1 taza", completo: false },
            { nombre: "Pechuga de pollo", categoria: "Proteína", imagenURL: "/path/to/image10.jpg", energia: "165 kcal", proteinas: "31g", grasas: "4g", hidratosDeCarbono: "0g", porciones: "150g", completo: false }
          ],
          Cena: [
            { nombre: "Sopa de verduras", categoria: "Verdura", imagenURL: "/path/to/image11.jpg", energia: "80 kcal", proteinas: "3g", grasas: "2g", hidratosDeCarbono: "12g", porciones: "1 taza", completo: false },
            { nombre: "Queso cottage", categoria: "Lácteo", imagenURL: "/path/to/image12.jpg", energia: "100 kcal", proteinas: "11g", grasas: "4g", hidratosDeCarbono: "3g", porciones: "1/2 taza", completo: false }
          ]
        },
        "2": {
          Desayuno: [
            { nombre: "Batido de proteínas", categoria: "Bebida", imagenURL: "/path/to/image13.jpg", energia: "200 kcal", proteinas: "20g", grasas: "5g", hidratosDeCarbono: "15g", porciones: "1 vaso", completo: false },
            { nombre: "Plátano", categoria: "Fruta", imagenURL: "/path/to/image14.jpg", energia: "105 kcal", proteinas: "1.3g", grasas: "0.3g", hidratosDeCarbono: "27g", porciones: "1 mediano", completo: false }
          ],
          Comida: [
            { nombre: "Salmón a la parrilla", categoria: "Proteína", imagenURL: "/path/to/image15.jpg", energia: "250 kcal", proteinas: "22g", grasas: "15g", hidratosDeCarbono: "0g", porciones: "150g", completo: false },
            { nombre: "Quinoa", categoria: "Cereal", imagenURL: "/path/to/image16.jpg", energia: "222 kcal", proteinas: "8g", grasas: "4g", hidratosDeCarbono: "39g", porciones: "1 taza", completo: false }
          ],
          Cena: [
            { nombre: "Wrap de pollo", categoria: "Proteína", imagenURL: "/path/to/image17.jpg", energia: "290 kcal", proteinas: "20g", grasas: "10g", hidratosDeCarbono: "30g", porciones: "1 wrap", completo: false },
            { nombre: "Batata asada", categoria: "Verdura", imagenURL: "/path/to/image18.jpg", energia: "180 kcal", proteinas: "4g", grasas: "0.2g", hidratosDeCarbono: "41g", porciones: "1 mediana", completo: false }
          ]
        },
        "3": {
          Desayuno: [
            { nombre: "Yogur griego con miel", categoria: "Lácteo", imagenURL: "/path/to/image19.jpg", energia: "150 kcal", proteinas: "10g", grasas: "5g", hidratosDeCarbono: "15g", porciones: "1 taza", completo: false },
            { nombre: "Fresas", categoria: "Fruta", imagenURL: "/path/to/image20.jpg", energia: "50 kcal", proteinas: "1g", grasas: "0.5g", hidratosDeCarbono: "11g", porciones: "1 taza", completo: false }
          ],
          Comida: [
            { nombre: "Hamburguesa de pavo", categoria: "Proteína", imagenURL: "/path/to/image21.jpg", energia: "300 kcal", proteinas: "28g", grasas: "12g", hidratosDeCarbono: "30g", porciones: "1 hamburguesa", completo: false },
            { nombre: "Batido verde", categoria: "Bebida", imagenURL: "/path/to/image22.jpg", energia: "180 kcal", proteinas: "3g", grasas: "0.5g", hidratosDeCarbono: "45g", porciones: "1 vaso", completo: false }
          ],
          Cena: [
            { nombre: "Sándwich de atún", categoria: "Proteína", imagenURL: "/path/to/image23.jpg", energia: "250 kcal", proteinas: "20g", grasas: "8g", hidratosDeCarbono: "30g", porciones: "1 sándwich", completo: false },
            { nombre: "Verduras al vapor", categoria: "Verdura", imagenURL: "/path/to/image24.jpg", energia: "50 kcal", proteinas: "3g", grasas: "0.5g", hidratosDeCarbono: "10g", porciones: "1 taza", completo: false }
          ]
        }
      };
      return dietas[id] || {};
    },
    handleSubmit() {
      this.dietaPorTipo = Object.keys(this.dietaPorTipo).reduce((acc, tipo) => {
        acc[tipo] = this.dietaPorTipo[tipo].map(alimento => ({ ...alimento, completo: true }));
        return acc;
      }, {});
      alert("Dieta completada!");
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
.tabla_alimentos {
  text-align: center;
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla_alimentos input {
  max-width: 7ch;
}

.tabla_alimentos td,
.tabla_alimentos th {
  max-width: 20ch;
  border: 1px solid #ddd;
  padding: 8px;
}

.tabla_alimentos th {
  background-color: #030303;
}

.tabla_alimentos tr:nth-child(odd) {
  background-color: #007bff;
  color: white;
}

.tabla_alimentos tr:nth-child(even) {
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
