<template>
  <div class="container">
    <header>
      <h1 class="texts__title">Inicio Usuario</h1>
    </header>
    <div class="info">
      <!-- Anuncio de rutinas -->
      <h2 class="texts__title2">Rutinas</h2>
      <section class="announcement">
        <div class="announcement__grid">
          <!-- Mostrar imágenes de rutinas -->
          <router-link v-for="(imageUrl, index) in imageUrls.slice(0, 4)" :key="index" :to="`/rutinapublico/${index}`"
            class="announcement__item" @click="selectRutina(index)">
            <img :src="imageUrl" alt="Rutina" style="width: 400px" />
          </router-link>
        </div>
      </section>
      <!-- Anuncio de dietas -->
      <h2 class="texts__title2">Dietas</h2>
      <section class="announcement">
        <div class="announcement__grid">
          <!-- Mostrar imágenes de dietas -->
          <router-link v-for="(imageUrl, index) in dietImageUrls.slice(0, 4)" :key="index"
            :to="`/dietapublico/${index}`" class="announcement__item" @click="selectDieta(index)">
            <img :src="imageUrl" alt="Dieta" style="width: 400px" />
          </router-link>
        </div>
      </section>
      <section class="buttons">
        <router-link class="buttons__btn buttons__btn--login" to="/login">Iniciar Sesión</router-link>
        <router-link class="buttons__btn buttons__btn--register" to="/register">Registrarse</router-link>
      </section>
    </div>

  </div>
</template>

<script>
import { useUserStore } from "../stores/user";
import { storage } from "../Firebase/index";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default {
  data() {
    return {
      imageUrls: [],
      dietImageUrls: [],
    };
  },
  mounted() {
    this.getImageUrlsFromFirebase();
  },
  methods: {
    async getImageUrlsFromFirebase() {
      // Get images from "Rutinas" folder (unchanged)
      const storageRefRutinas = ref(storage, "Rutinas");
      try {
        const listResultRutinas = await listAll(storageRefRutinas);
        for (const itemRef of listResultRutinas.items) {
          const url = await getDownloadURL(itemRef);
          this.imageUrls.push(url);
        }
      } catch (error) {
        console.error("Error al obtener las URLs de las rutinas:", error);
      }

      // Get images from "Dietas" folder (new)
      const storageRefDietas = ref(storage, "Dietas");
      try {
        const listResultDietas = await listAll(storageRefDietas);
        for (const itemRef of listResultDietas.items) {
          const url = await getDownloadURL(itemRef);
          this.dietImageUrls.push(url);
        }
      } catch (error) {
        console.error("Error al obtener las URLs de las dietas:", error);
      }
    },
    selectRutina(id) {
      const rutinaStore = useUserStore();
      rutinaStore.setRutinaSeleccionada(id);
    },
    selectDieta(id) {
      const dietasStore = useUserStore();
      dietasStore.setDietaSeleccionada(id);
    },
  },
};
</script>

<style scoped>
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

header {
  width: 100%;
  background-color: #157dcc;
  text-align: center;
  margin-bottom: 50px;
}

.texts__title2 {
  margin-top: 1em;
  text-align: left;
  font-size: 2.5em;
  font-weight: bold;
  background: #050505;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0px 3px 3px rgba(95, 68, 247, 0.836),
    0px -1px 1px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.3em;
}

.buttons {
  display: flex;
  justify-content: space-evenly;
  padding-top: 100px;
  padding-block-end: 50px;
}

.buttons__btn {
  text-decoration: none;
  padding: 1.3em 3em;
  font-size: 12px;
  font-weight: bold;

  letter-spacing: 2px;
  color: #fff;
  background-color: #282828;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;
}

.buttons__btn--login:hover {
  background-color: #27ca89;
  box-shadow: 0px 15px 20px rgba(41, 207, 141, 0.4);
  transform: translateY(-7px);
}

.buttons__btn--register:hover {
  background-color: #f53131;
  box-shadow: 0px 15px 20px rgba(229, 46, 46, 0.4);
  transform: translateY(-7px);
}

.buttons__btn:active {
  transform: translateY(-1px);
}

.announcement {
  margin-left: 30px;
  width: 30px;
  margin-bottom: 20px;
}

.announcement__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.announcement__item {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 15px;
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
