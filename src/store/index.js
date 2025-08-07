import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import meetings from './modules/meetings'
import rooms from './modules/rooms'
import users from './modules/users'
import specialDays from './modules/specialDays'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    meetings,
    rooms,
    users,
    specialDays
  },
  strict: process.env.NODE_ENV !== 'production'
})
