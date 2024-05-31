import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../Firebase";
import { useUserStore } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/rutinapublico/:id", // Usamos :id para indicar que este es un parámetro dinámico
      name: "rutinapublico",
      component: () => import("../views/RutinaPublicoView.vue"),
      props: true, // Permite pasar el parámetro como una prop al componente
    },
    {
      path: "/rutina", // Usamos :id para indicar que este es un parámetro dinámico
      name: "rutina",
      component: () => import("../views/RutinaView.vue"),
      meta: {
        auth: true,
        isAdmin: false,
      },
    },
    {
      path: "/dietapublico/:id",
      name: "dietapublico",
      component: () => import("../views/DietaPublicoView.vue"),
      props: true,
    },
    {
      path: "/dieta",
      name: "dieta",
      component: () => import("../views/DietaView.vue"),
      meta: {
        auth: true,
        isAdmin: false,
      },
    },
    {
      path: "/clientes",
      name: "clientes",
      component: () => import("../views/ClientesView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/citas",
      name: "citas",
      component: () => import("../views/CitasView.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/asignarrutina",
      name: "asignarrutina",
      component: () => import("../views/AsignarRutinaView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/asignardieta",
      name: "asignardieta",
      component: () => import("../views/AsignarDietaView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/ejercicios",
      name: "ejercicios",
      component: () => import("../views/EjerciciosView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/alimentos",
      name: "alimentos",
      component: () => import("../views/AlimentosView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/citasadministrador",
      name: "citasadministrador",
      component: () => import("../views/CitasAdministradorView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: {
        auth: true,
        isAdmin: false,
      },
    },
    {
      path: "/ranking",
      name: "ranking",
      component: () => import("../views/RankingView.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/datos",
      name: "datos",
      component: () => import("../views/DatosView.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/registroAdmind",
      name: "registroAdmind",
      component: () => import("../views/RegistroAdmindView.vue"),
      meta: {
        auth: true,
        isAdmin: true,
      },
    },
    {
      path: "/avances",
      name: "avances",
      component: () => import("../views/AvancesView.vue"),
      meta: {
        auth: true,
      },
    },
  ],
});

// Observador de cambios de estado de autenticación de Firebase
auth.onAuthStateChanged((user) => {
  const isAuthenticated = !!user;
  const authData = {
    isAuthenticated: isAuthenticated,
  };
  localStorage.setItem("auth", JSON.stringify(authData));
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = JSON.parse(
    localStorage.getItem("auth")
  ).isAuthenticated;

  // Acceder al estado de autenticación y de administrador desde Pinia
  const userStore = useUserStore();
  const isAdmin = userStore.isAdmin;
  //console.log(`Usuario autenticado en el router: ${isAuthenticated}`);
  //console.log(`Valor de isAdmin en el router: ${userStore.isAdmin}`);

  if (
    (to.path === "/login" || to.path === "/register" || to.path === "/") &&
    isAuthenticated
  ) {
    next("/dashboard");
  } else if (
    to.matched.some((record) => record.meta.auth) &&
    !isAuthenticated
  ) {
    next("/login");
    // para administradores
  } else if (
    to.matched.some((record) => record.meta.auth) &&
    to.matched.some((record) => record.meta.isAdmin === true) &&
    isAdmin === false
  ) {
    console.clear();
    console.log("Soy el del administrador");
    next("/dashboard");
    //para usuarios
  } else if (
    to.matched.some((record) => record.meta.auth) &&
    to.matched.some((record) => record.meta.isAdmin === false) &&
    isAdmin === true
  ) {
    console.clear();
    console.log("Soy el del usuario");
    next("/clientes");
  } else {
    next();
  }
});

export default router;
