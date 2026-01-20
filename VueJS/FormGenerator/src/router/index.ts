
import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'
import RegistrationPage from '../pages/RegistrationPage.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/registration',
        name: 'Registration',
        component: RegistrationPage
    }
    /*{
      path: '/anketa',
      name: 'Anketa',
      component: AnketaPage
    },
    {
      path: '/registration',
      name: 'Registration',
      component: RegistrationPage
    }*/
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
