import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue'
import router from './router'

const app = createApp(App);

const pinia = createPinia(); //inicializar pinia en una variable 
/* en los store/estados utilice el router de vue a traves de markRaw */
pinia.use (({ store }) => {
    store.$router = markRaw(router);
});

app.use(pinia); //poniendo a vue
app.use(router);

app.mount('#app');
