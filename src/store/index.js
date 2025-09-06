import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth';
import meetings from './modules/meetings';
import rooms from './modules/rooms';
import users from './modules/users';
import timeSlots from './modules/timeSlots';
import specialDays from './modules/specialDays';
import decisions from './modules/decisions';

import mailSettings from './modules/mailSettings';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
    meetings,
    rooms,
    users,
    timeSlots,
    specialDays,
    decisions,
    
    mailSettings
  }
})
