import AppLayout from "./AppLayout.vue"
import HomePage from "../pages/Homepage.vue"

import { createRouter, createWebHistory } from "vue-router";
// import Suivre_document from "../pages/suivre_document.vue";
import Informations from "../pages/informations.vue";
import Password from "../pages/password.vue";





import Welcomepage from "../pages/Welcomepage.vue";
import Signup from "../pages/signup.vue";
import Login from "../pages/login.vue";

import Forgotpassword from "../pages/forgotpassword.vue";
import Verfieremail from "../pages/verfieremail.vue";


import Registre from "../pages/registre.vue";


const routes = [
   
    {
        path: "/home",
        component: AppLayout,
        children: [
          {
            path: "/home",
            component: HomePage, 
          meta: { requiresAuth: false }
          },{
            path: "/info",
            component:Informations ,
           meta: { requiresAuth: false }
          },{
            path: "/password",
            component:Password ,
            meta: { requiresAuth: false }

         
          },]},
      {
        path: "/",
        component: Welcomepage,
      },
      {
        path: "/signup",
        component: Signup,
      },{
        path: '/registre/:email',
        component: Registre
        },
      {
        path: "/login",
        component: Login,
      },{
        path: "/forgot-password",
        component: Forgotpassword,
      },{
        path: "/verify-email",
        component: Verfieremail,
      },
      
 
];
const router = createRouter({
  history: createWebHistory("/protected/"),
  routes,
});
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");

  if (to.meta.requiresAuth && !token) {
    next("/login");  
  } else if ((to.path === "/login" || to.path === "/signup" || to.path === "/") && token) {
    next("/home"); 
  } else {
    next();
  }
});


export default router;