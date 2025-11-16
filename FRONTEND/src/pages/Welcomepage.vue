<template>
  <div>
    <WelcomeNav />

    <main class="bg-white min-h-screen">
      <section id="home" class="min-h-screen flex flex-col justify-center items-center pt-20 relative overflow-hidden">
        <div class="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div class="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-75"></div>
        <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-150"></div>

        <div class="max-w-4xl mx-auto px-6 py-20 w-full relative z-10 text-center">
          <div class="space-y-8">
            <div>
              <span class="text-3xl font-bold text-[#0A2A6B] uppercase">AI-Powered Career Platform</span>
            </div>
            
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-black text-[#0A2A6B] leading-tight">
              Transform Your 
              <span class="text-orange-500">Career</span> 
              with AI
            </h1>
            
            <div class="search-container">
              <input type="text" placeholder="Search for jobs, skills, or topics..." class="">
              <Icon name="fa-search" />
            </div>
            <div class="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              <button class="px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg group">
                <span>Get started</span>
                <Icon name="fa-arrow-right" class="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-200/50 max-w-5xl mx-auto">
              <div class="text-center">
                <div class="text-3xl font-black text-[#0A2A6B]">End-to-End Encryption</div>
                <div class="text-sm text-gray-600 font-medium mt-2">Your interviews and data are fully secured</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-black text-orange-500">You Own Your Data</div>
                <div class="text-sm text-gray-600 font-medium mt-2">Download or delete anytime</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-black text-blue-600">24/7 Monitoring</div>
                <div class="text-sm text-gray-600 font-medium mt-2">Constant security surveillance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-black text-[#0A2A6B] mb-6 uppercase">
              Our Features
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get hired faster with us
            </p>
          </div>

          <div class="grid grid-cols-1 gap-20 max-w-7xl mx-auto">
            <div class="flex flex-col lg:flex-row items-center gap-12 p-16 rounded-3xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 bg-white">
              <div class="flex-1 flex justify-center">
                <div class="relative">
                  <div class="w-100 h-80 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://i.imgur.com/9bfgECO.png" 
                      alt="AI Interview Practice"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </div>
              </div>
              
              <div class="flex-1 text-center lg:text-left">
                <h3 class="text-4xl font-bold text-[#0A2A6B] mb-6">AI Interview Coach</h3>
                <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                  Practice with realistic AI interviews that provide instant feedback on your answers, communication style, and confidence level.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                  <button class="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition duration-300 shadow-lg">
                    Try Now
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col lg:flex-row-reverse items-center gap-12 p-16 rounded-3xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 bg-white">
              <div class="flex-1 flex justify-center">
                <div class="relative">
                  <div class="w-100 h-80 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://i.imgur.com/SuqieEh.jpeg" 
                      alt="Resume Optimization"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </div>
              </div>
              
              <div class="flex-1 text-center lg:text-left">
                <h3 class="text-4xl font-bold text-[#0A2A6B] mb-6">Resume AI</h3>
                <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                  Smart optimization that helps your resume beat tracking systems and stand out to recruiters.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                  <button class="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition duration-300 shadow-lg">
                    Optimize
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col lg:flex-row items-center gap-12 p-16 rounded-3xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 bg-white">
              <div class="flex-1 flex justify-center">
                <div class="relative">
                  <div class="w-100 h-80 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://i.imgur.com/qlqkbsO.jpeg" 
                      alt="Career Guidance"
                      class="w-full h-full object-cover"
                    >
                  </div>
                </div>
              </div>
              
              <div class="flex-1 text-center lg:text-left">
                <h3 class="text-4xl font-bold text-[#0A2A6B] mb-6">Smart Career AI</h3>
                <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                  Your 24/7 AI career assistant providing personalized guidance and recommendations.
                </p>
                <div class="flex flex-col sm:flex-row gap-4">
                  <button class="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition duration-300 shadow-lg">
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Rest of sections remain similar but replace gradients with solid bg-white or bg-color -->

    </main>
  </div>
</template>


<script>
import WelcomeNav from '../components/welcomeNav.vue';
// You would also need to import your Icon component here
// import Icon from '../components/Icon.vue'; // Or wherever your Icon component is located

export default {
    name: "Welcomepage",
    components: { 
      WelcomeNav,
      // Icon // Don't forget to register your Icon component
    }
}
</script>