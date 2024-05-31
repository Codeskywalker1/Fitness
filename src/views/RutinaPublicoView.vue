<template>
  <div>
    <RutinaDetalle :id="idFromRoute" />
  </div>
</template>

<script>
import RutinaDetalle from "@/components/RutinaDetalle.vue";

export default {
  props: {
    id: String,
  },
  components: {
    RutinaDetalle,
  },
  computed: {
    idFromRoute() {
      // Access the ID from the route (assuming it's a dynamic parameter)
      return this.$route.params.id;
    },
  },
  data() {
    return {
      idRutinaSeleccionada: null,
    };
  },
  mounted() {
    this.idRutinaSeleccionada = this.$route.params.id;
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
</style>