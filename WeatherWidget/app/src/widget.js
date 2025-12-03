/* eslint-disable */
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

// We load Quasar stylesheet file
import 'quasar/dist/quasar.sass'

import { Quasar } from 'quasar'
import { createApp } from 'vue'
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import RootComponent from 'app/src/App.vue'


  const app = createApp(RootComponent)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate);

  app.use(pinia)

  app.config.performance = true


  app.use(Quasar/*, quasarUserOptions*/);

  app.mount('WeatherWidget');


