import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView)
new Vue({
  render: h => h(App),
}).$mount('#app')
