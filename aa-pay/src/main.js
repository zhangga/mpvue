import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

// https://www.jianshu.com/p/2c363ea29cda
// https://www.iviewui.com/docs/guide/start
// npm run lint -- --fix
// npm start
// npm run dev
const app = new Vue(App)
app.$mount()
