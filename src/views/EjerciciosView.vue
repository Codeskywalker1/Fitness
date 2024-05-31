<template>
  <div class="container">
    <header class="header">
      <navBarAdministrador />
    </header>
    <div class="info">
      <section>
        <h1 id="titulo">Agregar Ejercicio</h1>
        <div class="cuadro">
          <form @submit.prevent="agregarEjercicio">
            <div class="form-group">
              <input type="text" id="exercise-name" v-model="nombre" required autocomplete="off" />
              <label for="exercise-name">Nombre del Ejercicio:</label>
            </div>
            <div class="form-group">
              <select id="exercise-type" v-model="grupoMuscular" required>
                <option value="Pecho">Pecho</option>
                <option value="Abs">Abs</option>
                <option value="Espalda">Espalda</option>
                <option value="Bíceps">Bíceps</option>
                <option value="Tríceps">Tríceps</option>
                <option value="Pierna">Pierna</option>
                <option value="Hombro">Hombro</option>
                <option value="Compuestos">Compuestos</option>
              </select>
              <label for="exercise-type">Grupo Muscular:</label>
            </div>
            <div class="form-group">
              <input type="file" id="exercise-image" accept="image/*" @change="handleImageUpload" required />
              <label for="exercise-image">Imagen:</label>
            </div>
            <button class="boton2" type="submit">Agregar Ejercicio</button>
          </form>
        </div>
      </section>

      <section>
        <h1 id="titulo">Ejercicios guardados</h1>
        <div>
          <div class="busqueda">
            <div class="input-container">
              <input class="buscar" type="text" v-model="busqueda" placeholder="Buscar ejercicio..."
                @input="buscarEjercicio" />
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
          <table class="tabla-ejercicios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Grupo Muscular</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ejercicio, index) in ejerciciosFiltrados" :key="index">
                <td>{{ ejercicio.nombre }}</td>
                <td>{{ ejercicio.grupoMuscular }}</td>
                <td>
                  <img :src="ejercicio.imagenURL" alt="Imagen del ejercicio"
                    style="max-width: 100px; max-height: 100px" />
                </td>
                <td>
                  <button class="boton2" @click="eliminarEjercicio(ejercicio)">Eliminar</button>
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import navBarAdministrador from "@/components/navBarAdministrador.vue";


export default {
  data() {
    return {
      busqueda: "",
      nombre: "",
      grupoMuscular: "",
      imagen: null,
      imagenURL: "",
      ejercicios: [],
    };
  },
  components: {
    navBarAdministrador,
  },
  computed: {
    ejerciciosFiltrados() {
      if (this.busqueda.length > 0) {
        return this.ejercicios.filter((ejercicio) => {
          const busquedaMinuscula = this.busqueda.toLowerCase();
          return (
            ejercicio.nombre.toLowerCase().includes(busquedaMinuscula) ||
            ejercicio.grupoMuscular.toLowerCase().includes(busquedaMinuscula)
          );
        });
      } else {
        return this.ejercicios;
      }
    },
  },
  methods: {
    async agregarEjercicio() {
      try {
        // Obtener el archivo de imagen seleccionado por el usuario
        const imageFile = this.imagen;

        // Verificar si se seleccionó una imagen
        if (!imageFile) {
          console.error("Selecciona una imagen para el ejercicio.");
          return;
        }

        // Crear una referencia al almacenamiento de Firebase para subir la imagen
        const storageRef = ref(storage, `ejercicios/${imageFile.name}`);

        // Subir la imagen al almacenamiento de Firebase
        await uploadBytes(storageRef, imageFile);

        // Obtener la URL de descarga de la imagen subida
        const imageURL = await getDownloadURL(storageRef);

        // Agregar el ejercicio a la colección "ejercicios" con el nombre como ID del documento
        const ejercicioData = {
          nombre: this.nombre,
          grupoMuscular: this.grupoMuscular,
          imagenURL: imageURL,
        };

        await setDoc(doc(db, "ejercicios", this.nombre), ejercicioData);

        // Limpiar los campos del formulario
        this.nombre = "";
        this.grupoMuscular = "";
        this.imagen = null;
        this.imagenURL = "";

        // Volver a cargar los ejercicios para reflejar el nuevo ejercicio agregado
        this.cargarEjercicios();
      } catch (error) {
        console.error("Error al agregar el ejercicio:", error);
      }
    },
    async cargarEjercicios() {
      try {
        const querySnapshot = await getDocs(collection(db, "ejercicios"));
        this.ejercicios = [];
        querySnapshot.forEach((doc) => {
          this.ejercicios.push(doc.data());
        });
        // Ordenar los ejercicios por nombre alfabéticamente
        this.ejercicios.sort((a, b) => a.nombre.localeCompare(b.nombre));
        console.log("Ejercicios cargados:", this.ejercicios);
      } catch (error) {
        console.error("Error al cargar los ejercicios:", error);
      }
    },
    async eliminarEjercicio(ejercicio) {
      try {

        // Obtener la URL de la imagen del ejercicio
        const imageURL = ejercicio.imagenURL;

        await deleteDoc(doc(db, "ejercicios", ejercicio.nombre));
        console.log("Ejercicio eliminado:", ejercicio.nombre);


        // Eliminar la imagen del almacenamiento de Firebase
        const storageRef = ref(storage, imageURL);
        await deleteObject(storageRef);
        console.log("Imagen asociada al ejercicio eliminada");
        // Volver a cargar los ejercicios para reflejar el cambio
        this.cargarEjercicios();
      } catch (error) {
        console.error("Error al eliminar el ejercicio:", error);
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
    this.cargarEjercicios();
  },
};
</script>

<style>
.cuadro {
  margin: 30px auto;
  width: 550px;
  height: 375px;
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

#titulo {
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

#exercise-type {
  background-color: #282828;
  color: white;
}

.tabla-ejercicios {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-ejercicios th,
.tabla-ejercicios td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.tabla-ejercicios th {
  background-color: #030303;
}

.tabla-ejercicios tr:hover {
  background-color: #f9f9f9;
}

.tabla-ejercicios tr:nth-child(even) {
  background-color: #cceeff;
  /* Color azul más suave para filas pares */
}

.tabla-ejercicios tr:nth-child(odd) {
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

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
