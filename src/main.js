import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)

// Set up axios
axios.defaults.baseURL = 'http://localhost:3000/api'
app.use(VueAxios, axios)
app.provide('axios', app.config.globalProperties.axios)

app.use(router)
app.mount('#app')
