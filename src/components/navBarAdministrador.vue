<template>
  <header class="navbarAdmin">
    <nav>
      <ul>
        <li><router-link to="/citasadministrador">Mis Citas</router-link></li>
        <li><router-link to="/ejercicios">Ejercicios</router-link></li>
        <li><router-link to="/alimentos">Alimentos</router-link></li>
        <li><router-link to="/registroAdmind">Registrar usuarios</router-link></li>
        <li><router-link to="/Ranking">Ranking</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<style>
.navbarAdmin {
  font-size: 25px;
  display: flex;
  justify-content: space-around;
  background: #282828;
  color: #fff;
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  align-items: center;
  top: 0;
  left: 0;
}

.navbarAdmin ul {
  display: flex;
  list-style: none;
  padding: 0;
}

.navbarAdmin li {
  padding: 10px 20px;
}

.navbarAdmin a {
  text-decoration: none;
  color: inherit;
}

.navbarAdmin a:hover {
  color: #00ff00;
}
</style>