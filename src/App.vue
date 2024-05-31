<script>
import { RouterView } from "vue-router";
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap");

* {
  margin: 0%;
  padding: 0%;
}

body {
  font-family: ubuntu;
  background: -webkit-linear-gradient(90deg, rgb(169, 241, 241) 10%, rgb(0, 195, 255) 90%);
  background: -moz-linear-gradient(90deg, rgb(169, 241, 241) 10%, rgb(0, 195, 255) 90%);
  background: -ms-linear-gradient(90deg, rgb(169, 241, 241) 10%, rgb(0, 195, 255) 90%);
  background: -o-linear-gradient(90deg, rgb(169, 241, 241) 10%, orange 90%);
  background: linear-gradient(90deg, rgb(169, 241, 241) 10%, rgb(0, 195, 255) 90%);
}
</style>
