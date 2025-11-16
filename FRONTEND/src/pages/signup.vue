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
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email to get started. We’ll guide you from there.
        </p>
      </div>
      <div v-if="message" :class="['p-3 rounded-md text-center text-sm font-medium shadow-sm', messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800']">
        {{ message }}
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="createUserAccount" novalidate>
        <div class="rounded-md shadow-sm -space-y-px">
          <div v-if="this.show">
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              v-model.trim="email"
              required
              class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3498DB] focus:border-[#3498DB] sm:text-sm"
              placeholder="Email address"
              aria-label="Email address"
            />
          </div>
        </div>
        <div>
          <button type="submit" v-if="this.show" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0a2a6b] hover:bg-[#2980B9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3498DB] transition duration-150 ease-in-out disabled:opacity-60" :disabled="isSubmitting || !email">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3" v-if="isSubmitting">
              <svg class="h-5 w-5 text-blue-200 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="isSubmitting">Creating account...</span>
            <span v-else>Continue</span>
          </button>
        </div>
      </form>
      <div class="text-sm text-center pt-4 border-t border-gray-200">
        <p class="text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../util/axios.js";

export default {
  name: "CreateUser",
  data() {
    return {
      email: '',
      isSubmitting: false,
      message: null,
      messageType: 'error',
      show: true
    };
  },
  methods: {
    async createUserAccount() {
      if (!this.email) {
        this.message = "Email address is required.";
        this.messageType = 'error';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.message = "Please enter a valid email address.";
        this.messageType = 'error';
        return;
      }

      this.isSubmitting = true;
      this.message = null;

      axios.post(`/protected-resource/Authen/CreateUser?email=${this.email}`)
        .then(() => {
          this.message = "Account successfully initialized! Please check your inbox to complete your registration.";
          this.messageType = 'success';
          this.email = '';
          this.show = false;
        })
        .catch((error) => {
          this.messageType = 'error';
          if (error.response && error.response.data && error.response.data.message) {
            this.message = `Error: ${error.response.data.message}`;
          } else if (error.response && error.response.status) {
            this.message = `Error ${error.response.status}. Unable to create account.`;
          } else if (error.request) {
            this.message = "Network error. Unable to contact server.";
          } else {
            this.message = "An unexpected error occurred.";
          }
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
  },
};
</script>
