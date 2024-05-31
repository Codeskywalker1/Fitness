<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <div class="info">
      <section>
        <h1 class="titulo">Agregar Alimento</h1>
        <div class="cuadro2">
          <form @submit.prevent="agregarAlimento">
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="alimento-name" v-model="nombre" required autocomplete="off" />
                <label for="alimento-name">Nombre del alimento:</label>
              </div>
              <div class="form-group">
                <select id="alimento-type" v-model="categoria" required>
                  <option value="Verduras">Verduras</option>
                  <option value="Frutas">Frutas</option>
                  <option value="CerealesTuberculos">
                    Cereales y tubérculos
                  </option>
                  <option value="CerealesTuberculosGrasa">
                    Cereales y tubérculos con grasa
                  </option>
                  <option value="Leguminosas">Leguminosas</option>
                  <option value="AOAAltosGrasa">AOA Altos en grasa</option>
                  <option value="LecheEntera">Leche entera</option>
                  <option value="LecheDescremada">Leche descremada</option>
                  <option value="Lipidos">Lípidos (aceites y grasas)</option>
                  <option value="LipidosProteinas">
                    Lípidos (grasas con proteínas)
                  </option>
                  <option value="Azucares">Azucares</option>
                  <option value="AzucaresGrasa">Azucares con grasa</option>
                </select>
                <label for="alimento-type">Categoria:</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="alimento-energy" v-model="energia" required autocomplete="off" />
                <label for="alimento-energy">Energia:</label>
              </div>
              <div class="form-group">
                <input type="text" id="alimento-proteinas" v-model="proteinas" required autocomplete="off" />
                <label for="alimento-proteinas">Proteinas:</label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <input type="text" id="alimento-hidratos" v-model="hidratosDeCarbono" required autocomplete="off" />
                <label for="alimento-hidratos">Hidratos de Carbono:</label>
              </div>
              <div class="form-group">
                <input type="text" id="alimento-grasas" v-model="grasas" required autocomplete="off" />
                <label for="alimento-grasas">Grasas:</label>
              </div>
            </div>

            <div class="form-group">
              <input type="file" id="alimento-image" accept="image/*" @change="handleImageUpload" required />
              <label for="alimento-image">Imagen:</label>
            </div>
            <button class="boton2" type="submit">Agregar Alimento</button>
          </form>
        </div>
      </section>
      <section>
        <h1 class="titulo">Alimentos guardados</h1>
        <div>
          <div class="busqueda">
            <div class="input-container">
              <input class="buscar" type="text" v-model="busqueda" placeholder="Buscar alimento..."
                @input="buscarAlimento" />
              <i class="fas fa-search"></i>
            </div>
          </div>
          <div class="button">
            <router-link to="/clientes">
              <button class="buttons__btn1">Regresar</button>
            </router-link>
          </div>
        </div>
        <div>
          <table class="tabla-alimentos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>imagen</th>
                <th>Energia</th>
                <th>Proteinas</th>
                <th>Grasas</th>
                <th>Hidratos de Carbono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alimento, index) in alimentosFiltrados" :key="index">
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
                <td>
                  <button class="boton2" @click="eliminarAlimento(alimento)">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>


<script>
import { db, storage } from "../Firebase/index";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import navBarAdministrador from "@/components/navBarAdministrador.vue";

export default {
  data() {
    return {
      busqueda: "",
      nombre: "",
      categoria: "",
      imagen: null,
      imagenURL: "",
      alimentos: [],
      energia: "",
      proteinas: "",
      grasas: "",
      hidratosDeCarbono: "",
    };
  },
  components: {
    navBarAdministrador,
  },
  computed: {
    alimentosFiltrados() {
      if (this.busqueda.length > 0) {
        return this.alimentos.filter((alimento) => {
          const busquedaMinuscula = this.busqueda.toLowerCase();
          return (
            alimento.nombre.toLowerCase().includes(busquedaMinuscula) ||
            alimento.categoria.toLowerCase().includes(busquedaMinuscula)
          );
        });
      } else {
        return this.alimentos;
      }
    },
  },
  methods: {
    async agregarAlimento() {
      try {
        // Obtener el archivo de imagen seleccionado por el usuario
        const imageFile = this.imagen;

        // Verificar si se seleccionó una imagen
        if (!imageFile) {
          console.error("Selecciona una imagen para el alimento.");
          return;
        }

        // Crear una referencia al almacenamiento de Firebase para subir la imagen
        const storageRef = ref(storage, `alimentos/${imageFile.name}`);

        // Subir la imagen al almacenamiento de Firebase
        await uploadBytes(storageRef, imageFile);

        // Obtener la URL de descarga de la imagen subida
        const imageURL = await getDownloadURL(storageRef);

        // Agregar el alimento a la colección "alimentos" con el nombre como ID del documento
        const alimentoData = {
          nombre: this.nombre,
          categoria: this.categoria,
          imagenURL: imageURL,
          energia: this.energia,
          proteinas: this.proteinas,
          grasas: this.grasas,
          hidratosDeCarbono: this.hidratosDeCarbono,
        };

        await setDoc(doc(db, "alimentos", this.nombre), alimentoData);

        // Limpiar los campos del formulario
        this.nombre = "";
        this.categoria = "";
        this.imagen = null;
        this.imagenURL = "";
        this.energia = "";
        this.proteinas = "";
        this.grasas = "";
        (this.hidratosDeCarbono = ""),
          // Volver a cargar los alimentos para reflejar el nuevo alimento agregado
          this.cargarAlimentos();
      } catch (error) {
        console.error("Error al agregar el alimentos:", error);
      }
    },
    async cargarAlimentos() {
      try {
        const querySnapshot = await getDocs(collection(db, "alimentos"));
        this.alimentos = [];
        querySnapshot.forEach((doc) => {
          this.alimentos.push(doc.data());
        });
        // Ordenar los alimentos por nombre alfabéticamente
        this.alimentos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        console.log("Alimentos cargados:", this.alimentos);
      } catch (error) {
        console.error("Error al cargar los alimentos:", error);
      }
    },
    async eliminarAlimento(alimento) {
      try {
        // Obtener la URL de la imagen del alimento
        const imageURL = alimento.imagenURL;

        await deleteDoc(doc(db, "alimentos", alimento.nombre));
        console.log("Alimento eliminado:", alimento.nombre);

        // Eliminar la imagen del almacenamiento de Firebase
        const storageRef = ref(storage, imageURL);
        await deleteObject(storageRef);
        console.log("Imagen asociada al alimento eliminada");
        // Volver a cargar los alimentos para reflejar el cambio
        this.cargarAlimentos();
      } catch (error) {
        console.error("Error al eliminar el alimento:", error);
      }
    },
    handleImageUpload(event) {
      try {
        const file = event.target.files[0];
        this.imagen = file;
        this.imagenURL = URL.createObjectURL(file);
      } catch (error) {
        console.error("Error al manejar la carga de la imagen:", error);
      }
    },
  },
  mounted() {
    this.cargarAlimentos();
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

.cuadro2 {
  margin: 30px auto;
  width: 550px;
  height: 575px;
  padding: 40px;
  background: #282828;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

label,
input,
select,
button {
  display: block;
  margin-bottom: 10px;
}

.table-container {
  max-width: 800px;
  margin: 20px auto;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.form-row {
  gap: 50px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-group {
  margin-top: 40px;
  margin-block-end: 20px;
  flex: 1;
  margin-right: 20px;
  /* Espacio entre columnas */
  position: relative;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  background: transparent;
  color: #fff;
}

.form-group label {
  position: absolute;
  left: 0;
  transition: top 0.3s, font-size 0.3s;
  margin-bottom: 10px;
  top: -20px;
  left: 0;
  color: #03e9f4;
  font-size: 12px;
}

#alimento-type {
  background-color: #282828;
  color: white;
}

button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

button:hover {
  background-color: #555;
}

.tabla-alimentos {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-alimentos th,
.tabla-alimentos td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.tabla-alimentos th {
  background-color: #030303;
}

.tabla-alimentos tr:hover {
  background-color: #f9f9f9;
}

.tabla-alimentos tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.tabla-alimentos tr:nth-child(odd) {
  background-color: #007bff;
  /* Color azul para filas impares */
  color: white;
}

.busqueda {
  display: inline-block;
  padding: 0.8em;
}

.buscar {
  font-size: 1.3em;
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

.info {
  margin-left: 2.5em;
  margin-right: 2.5em;
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

.titulo {
  margin-top: 1em;
  text-align: left;
  font-size: 3em;
  font-weight: bold;
  background: #050505;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0px 3px 3px rgba(95, 68, 247, 0.836),
    0px -1px 1px rgba(0, 0, 0, 0.3);
}
</style>