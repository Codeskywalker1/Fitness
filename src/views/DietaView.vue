<template>
  <div class="container">
    <header class="header">
      <navBarUsuario />
    </header>
    <section class="info">
      <div>
        <h1 id="titulo"> Dieta </h1>
        <div class="box">
          <h2 class="tituloform">Ingresa la Fecha</h2>
          <vue3-datepicker class="sombreado" v-model="fechaSeleccionada" :typeable="true" />
        </div>
        <div class="cajaBoton">
          <router-link to="/">
            <button class="buttons__btn1">Regresar</button>
          </router-link>
        </div>
      </div>
      <div v-if="dietaLograda === false">
        <form @submit.prevent="handleSubmit">
          <div v-for="(alimentos, tipo) in dietaPorTipo" :key="tipo">
            <h2>{{ tipo }}</h2>
            <table class="tabla_alimentos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoria</th>
                  <th>Ejemplo</th>
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
                  <td>
                    <img :src="alimento.imagenURL" alt="Imagen del alimento"
                      style="max-width: 100px; max-height: 100px" />
                  </td>
                  <td>{{ alimento.energia }}</td>
                  <td>{{ alimento.proteinas }}</td>
                  <td>{{ alimento.grasas }}</td>
                  <td>{{ alimento.hidratosDeCarbono }}</td>
                  <td>{{ alimento.porciones }}</td>
                  <td>
                    <input type="checkbox" :id="getCheckboxId(tipo, alimento.nombre)"
                      :name="getCheckboxName(tipo, alimento.nombre)"
                      v-model="alimentosCompletados[tipo][alimento.nombre]" @change="checkAllAlimentosCompletados">
                  </td>
                </tr>
              </tbody>
            </table>
            <button class="boton2" type="button" @click="handleSubmitPorTipo(tipo)">Actualizar {{ tipo }}</button>
          </div>
          <button class="boton2" type="submit" :disabled="!todosAlimentosRealizados || !hayDieta">Dieta
            Completa</button>
        </form>
      </div>
      <div v-else-if="dietaLograda === true">
        <p>Se realizó la dieta</p>
        <p>{{ dietaLograda }}</p>
      </div>
      <div v-else>
        <p>No hay dieta</p>
      </div>
    </section>
  </div>
</template>

<script>
import navBarUsuario from "@/components/navBarUsuario.vue";
import Vue3Datepicker from "vue3-datepicker";
import { useUserStore } from "../stores/user";
import { db, auth } from "../Firebase/index"; // Asegúrate de importar auth de Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";

export default {
  data() {
    return {
      alimentos: [],
      isLocalAdmin: false,
      currentUserUID: null,
      fechaSeleccionada: null,
      dietaPorTipo: {},
      alimentosCompletados: {},
      dietaLograda: false,
      usuario: null,
      hayDieta: false,
    };
  },
  computed: {
    todosAlimentosRealizados() {
      for (let tipo in this.dietaPorTipo) {
        for (let alimento of this.dietaPorTipo[tipo]) {
          if (!this.alimentosCompletados[tipo][alimento.nombre]) {
            return false;
          }
        }
      }
      return true;
    }
  },
  components: {
    navBarUsuario,
    Vue3Datepicker,
  },
  methods: {
    getCheckboxId(tipo, nombre) {
      return `alimentoCompletado-${tipo}-${nombre}`;
    },
    getCheckboxName(tipo, nombre) {
      return `alimentoCompletado-${tipo}`;
    },
    isAlimentoCompletado(tipo, nombre) {
      return this.alimentosCompletados[tipo] && this.alimentosCompletados[tipo][nombre];
    },
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
      const docRef = doc(db, 'dietas', this.currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dietas = docSnap.data();
        const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
        if (dietas[fechaFormateada]) {
          Object.keys(dietas[fechaFormateada]).forEach(tipo => {
            Object.keys(dietas[fechaFormateada][tipo]).forEach(alimento => {
              dietas[fechaFormateada][tipo][alimento].alimentoCompletado = this.alimentosCompletados[tipo][alimento] || false;
            });
          });

          await setDoc(docRef, dietas);
          console.log('Dieta guardada con éxito');
        } else {
          console.error('No hay dieta para la fecha seleccionada');
        }
      } else {
        console.error('Error al recuperar la dieta del usuario:', this.currentUserUID);
      }
      await this.actualizarRanking();
      window.location.reload();
    },
    async handleSubmitPorTipo(tipo) {
      const docRef = doc(db, 'dietas', this.currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dietas = docSnap.data();
        const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
        if (dietas[fechaFormateada] && dietas[fechaFormateada][tipo]) {
          Object.keys(dietas[fechaFormateada][tipo]).forEach(alimento => {
            dietas[fechaFormateada][tipo][alimento].alimentoCompletado = this.alimentosCompletados[tipo][alimento] || false;
          });

          await setDoc(docRef, dietas);
          console.log(`Dieta de ${tipo} guardada con éxito`);
        } else {
          console.error(`No hay dieta de ${tipo} para la fecha seleccionada`);
        }
      } else {
        console.error('Error al recuperar la dieta del usuario:', this.currentUserUID);
      }
      window.location.reload();
    },

    async mostrarDieta() {
      if (!this.fechaSeleccionada) {
        this.hayDieta = false;
        return;
      }

      const fechaFormateada = this.fechaSeleccionada.toLocaleDateString('es-ES');
      const docRef = doc(db, 'dietas', this.currentUserUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dietas = docSnap.data();
        if (dietas[fechaFormateada]) {
          // Ordenar las claves (tipos de comida) en el orden deseado
          const tiposOrdenados = ['Desayuno', 'Comida', 'Cena'];
          this.dietaPorTipo = {};
          this.alimentosCompletados = {};

          // Iterar sobre los tipos de comida en el orden deseado
          tiposOrdenados.forEach(tipo => {
            if (dietas[fechaFormateada][tipo]) {
              this.dietaPorTipo[tipo] = Object.values(dietas[fechaFormateada][tipo]);
              this.alimentosCompletados[tipo] = this.dietaPorTipo[tipo].reduce((acc, alimento) => {
                acc[alimento.nombre] = alimento.alimentoCompletado || false;
                return acc;
              }, {});
            }
          });

          this.hayDieta = true;
          this.dietaLograda = Object.keys(this.alimentosCompletados).every(tipo =>
            Object.keys(this.alimentosCompletados[tipo]).every(alimento =>
              this.alimentosCompletados[tipo][alimento]
            )
          );

        } else {
          this.dietaPorTipo = {};
          this.alimentosCompletados = {};
          this.hayDieta = false;
        }
      } else {
        console.error('Error al recuperar la dieta del usuario:', this.currentUserUID);
        this.hayDieta = false;
      }
    },
    checkAllAlimentosCompletados() {
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
      this.mostrarDieta();
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
