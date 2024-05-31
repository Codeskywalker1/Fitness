<template>
  <div>
    <DietaDetalle :id="idFromRoute" />
  </div>
</template>

<script>
import DietaDetalle from "@/components/DietaDetalle.vue";

export default {
  components: {
    DietaDetalle,
  },
  computed: {
    idFromRoute() {
      return this.$route.params.id;
    },
  },
  data() {
    return {
      idDietaSeleccionada: null,
    };
  },
  mounted() {
    this.idDietaSeleccionada = this.$route.params.id;
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
}

</style>