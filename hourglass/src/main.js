import Vue from 'vue'
import App from './App.vue'
import store from './store'
import VueSimpleAlert from "vue-simple-alert";
import VueGlobalVariable from 'vue-global-var'
// notification message
import VueNotification from "@kugatsu/vuenotification";
import VueCookies from 'vue-cookies'


Vue.use(VueSimpleAlert);
Vue.config.productionTip = false

Vue.use(VueCookies);
Vue.$cookies.config('1y');

Vue.use(VueNotification, {
  primary: {
    background: "#85c0ff",
    color: 'white'
  },
  error: {
    background: "#c73232",
    color: 'white'
  }
});

Vue.use(VueGlobalVariable, {
  globals: {
    $isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    $allMeetingTime: null,
  }
});

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
