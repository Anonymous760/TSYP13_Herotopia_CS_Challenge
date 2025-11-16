<template>
  <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

      <!-- Logo / Title -->
      <RouterLink to="/home" class="flex items-center" aria-label="Go to Homepage">
  <img 
    src="https://i.imgur.com/ljCbl1O.png" 
    alt="Mermaid Logo" 
    class="h-12 sm:h-16" 
  />
</RouterLink>


      <!-- Mobile Menu Button -->
      <button class="md:hidden text-[#0A2A6B] text-xl">
        <i class="fa-solid fa-bars"></i>
      </button>

      <!-- Desktop Menu -->
      <div id="navmenu" class="hidden md:flex items-center space-x-8">
        <a href="#home" class="text-[#0A2A6B] font-semibold hover:text-[#d35500] transition-colors duration-300 relative group">
          Home
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d35500] group-hover:w-full transition-all duration-300"></span>
        </a>

        <a href="#features" class="text-[#0A2A6B] font-semibold hover:text-[#d35500] transition-colors duration-300 relative group">
          Features
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d35500] group-hover:w-full transition-all duration-300"></span>
        </a>

        <a href="#how-it-works" class="text-[#0A2A6B] font-semibold hover:text-[#d35500] transition-colors duration-300 relative group">
          How It Works
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d35500] group-hover:w-full transition-all duration-300"></span>
        </a>

        <a href="contact.html" class="text-[#0A2A6B] font-semibold hover:text-[#d35500] transition-colors duration-300 relative group">
          Contact Us
          <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#d35500] group-hover:w-full transition-all duration-300"></span>
        </a>

        <!-- Buttons -->
        <div class="flex items-center space-x-4">
          <router-link to="/login" class="px-6 py-2.5 text-[#0A2A6B] font-semibold border border-[#0A2A6B] rounded-xl hover:bg-[#0A2A6B] hover:text-white transition-all duration-300 hover:scale-105">
            Login
          </router-link>

           <router-link to="/signup" class="bg-[#0A2A6B] text-white px-6 py-2.5 rounded-xl font-bold text-lg hover:bg-blue-800 transition duration-300 shadow-lg">
            Sign Up
            </router-link>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
import { RouterLink } from 'vue-router';

export default {
  name: "WelcomeNav"
}
</script>

<style scoped>
/* gradient removed → no style needed */
</style>
