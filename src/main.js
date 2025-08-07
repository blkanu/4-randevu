import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap Vue
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Form validation
import Vuelidate from 'vuelidate'

// Calendar
import VCalendar from 'v-calendar'

// HTTP client
import axios from 'axios'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Vuelidate)
Vue.use(VCalendar)

// Set up axios defaults
Vue.prototype.$http = axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api'
axios.defaults.headers.common['Content-Type'] = 'application/json'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
