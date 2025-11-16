<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 sm:p-10 lg:p-12 rounded-xl shadow-lg space-y-8 border border-gray-200">

      <div>
         <router-link to="/" class="flex justify-center">
            <span class="text-4xl sm:text-5xl font-bold text-[#0a2a6b]">
               UtopiaHire
            </span>
         </router-link>
      </div>

      <div class="text-center">
        <h2 class="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

       <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-center text-sm font-medium shadow-sm">
         {{ error }}
       </div>

      <form class="mt-8 space-y-6" @submit.prevent="login" novalidate>
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="form.email"
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm"
              placeholder="Email address"
              aria-label="Email address"
            />
          </div>
          <div class="relative">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              v-model="form.password"
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm pr-10"
              placeholder="Password"
              aria-label="Password"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
              aria-label="Show/Hide password"
            >
              <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-end">
          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline">
              Forgot password?
            </router-link>
          </div>
        </div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0a2a6b] hover:bg-[#2980B9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3498DB] transition duration-150 ease-in-out disabled:opacity-60" :disabled="isLoading || !form.email || !form.password">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3" v-if="isLoading">
              <svg class="h-5 w-5 text-blue-200 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </div>
      </form>

      <div class="text-sm text-center pt-4 border-t border-gray-200">
         <p class="text-gray-600">
            Don't have an account yet?
            <router-link to="/signup" class="font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline">
               Sign up
            </router-link>
         </p>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "../util/axios.js";

export default {
  name: "Login",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
      isLoading: false,
      error: null,
      showPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      this.isLoading = true;
      this.error = null;

      if (!this.form.email || !this.form.password) {
        this.error = "Please enter email and password.";
        this.isLoading = false;
        return;
      }

      try {
        const response = await axios.post("/protected-resource/Authen/login", {
          email: this.form.email,
          password: this.form.password,
        });

        if (response.status === 200 && response.data && response.data.token) {
          const token = response.data.token;
          localStorage.setItem("authToken", token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          this.$router.push("/home");
        } else {
          this.error = "Login failed. Invalid server response.";
        }
      } catch (err) {
         this.error = "An error occurred.";

         if (err.response) {
             if (err.response.status === 401 || err.response.status === 400) {
                  this.error = "Incorrect email or password.";
             } else if (err.response.data && err.response.data.message) {
                 this.error = `${err.response.data.message} (Error ${err.response.status})`;
             } else if (err.response.data && typeof err.response.data === 'string') {
                 this.error = `${err.response.data} (Error ${err.response.status})`;
             } else {
                 this.error = `Server error (${err.response.status}). Please try again later.`;
             }
         } else if (err.request) {
             this.error = "Unable to reach the server. Check your network connection.";
         } else {
             this.error = "Error preparing the request.";
         }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
</style>
