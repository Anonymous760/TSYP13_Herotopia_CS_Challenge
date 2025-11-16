<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl w-full bg-white p-8 sm:p-10 lg:p-12 rounded-xl shadow-lg space-y-8 border border-gray-200">
      <div>
        <router-link to="/" class="flex justify-center">
          <span class="text-4xl sm:text-5xl font-bold text-[#0a2a6b]">
            UtopiaHire
          </span>
        </router-link>
      </div>

      <div class="text-center">
        <h2 class="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900">
          Complete Your Registration
        </h2>
        <p v-if="registrationEmail" class="mt-2 text-sm text-gray-600">
          Account creation for <span class="font-medium">{{ registrationEmail }}</span>
        </p>
        <p v-else-if="!routeError" class="mt-2 text-sm text-gray-400 animate-pulse">
          Loading email...
        </p>
        <p v-else class="mt-2 text-sm text-red-600">
          {{ routeError }}
        </p>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-center text-sm font-medium shadow-sm">
        {{ error }}
      </div>

      <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-center text-sm font-medium shadow-sm">
        {{ successMessage }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="register" novalidate>
        <div class="space-y-4">
        
          <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <label for="first-name" class="sr-only">First Name</label>
              <input
                id="first-name"
                name="firstName"
                type="text"
                autocomplete="given-name"
                required
                v-model.trim="form.firstName"
                :disabled="isLoading || !registrationEmail"
                class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="First Name"
                aria-label="First Name"
              />
            </div>
            <div>
              <label for="last-name" class="sr-only">Last Name</label>
              <input
                id="last-name"
                name="lastName"
                type="text"
                autocomplete="family-name"
                required
                v-model.trim="form.lastName"
                :disabled="isLoading || !registrationEmail"
                class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Last Name"
                aria-label="Last Name"
              />
            </div>
          </div>

          
          <div>
             <label for="numero-tel" class="sr-only">Phone Number</label>
             <input
               id="numero-tel"
               name="numeroTel"
               type="tel"
               autocomplete="tel"
               required
               v-model.trim="form.numeroTel"
               :disabled="isLoading || !registrationEmail"
               class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
               placeholder="Phone Number"
               aria-label="Phone Number"
             />
          </div>


          
          <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 ">
            <div class="space-y-1 ">
              <label for="password" class="sr-only">Password</label>
              <div class=" mb-4 relative ">
                <input
                  id="password"
                  name="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  v-model="form.password"
                  @input="checkPasswordStrength"
                  :disabled="isLoading || !registrationEmail"
                  class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                  placeholder="Password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('password')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
                  aria-label="Show/Hide Password"
                  :disabled="isLoading || !registrationEmail"
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

              <div v-if="form.password.length > 0 && registrationEmail" class="mt-2 space-y-1">
                <div class="flex -mx-0.5">
                  <div v-for="(segment, index) in passwordSegments" :key="index" :class="['h-1.5 flex-auto rounded-full mx-0.5 transition-colors duration-200', segment.class]"></div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500">Strength:</span>
                  <span :class="['text-xs font-semibold', passwordStrengthLevelText.color]">{{ passwordStrengthLevelText.text }}</span>
                </div>
                <h4 class="pt-1 text-xs font-semibold text-gray-700">Password must contain:</h4>
                <ul class="space-y-0.5 text-xs text-gray-500">
                  <li v-for="(status, key) in passwordMeetsCriteria" :key="key" :class="['flex items-center gap-x-1.5 transition-colors duration-200', status ? 'text-green-600' : 'text-gray-400']">
                    <svg v-if="status" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span>{{ passwordCriteriaText[key] }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="space-y-1 ">
              <label for="confirm-password" class="sr-only">Confirm Password</label>
              <div class=" mb-4 relative ">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  v-model="form.confirmPassword"
                  @input="validatePasswordConfirmation"
                  :disabled="isLoading || !registrationEmail"
                  class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB] focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                  placeholder="Confirm Password"
                  aria-label="Confirm Password"
                />
                  <button
                    type="button"
                    @click="togglePasswordVisibility('confirmPassword')"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
                    aria-label="Show/Hide Confirm Password"
                    :disabled="isLoading || !registrationEmail"
                  >
                    <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" />
                    </svg>
                  </button>
              </div>
              <p v-if="passwordConfirmationError" class="text-xs text-red-600">
                {{ passwordConfirmationError }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0a2a6b] hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2ECC71] transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                      :disabled="isLoading || !isFormValid || !registrationEmail || routeError">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3" v-if="isLoading">
              <svg class="h-5 w-5 text-green-100 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-if="isLoading">Registering...</span>
            <span v-else>Confirm</span>
          </button>
        </div>
      </form>

      
    </div>
  </div>
</template>

<script>
  import axios from "../util/axios.js";
  
  export default {
    name: "Registre",
    data() {
      return {
        registrationEmail: null,
        form: {
          lastName: "",
          firstName: "",
          numeroTel: "", // Phone Number
          password: "",
          confirmPassword: ""
        },
        isLoading: false,
        error: null,
        successMessage: null,
        routeError: null,
        showPassword: false,
        showConfirmPassword: false,
        passwordStrengthLevel: 0,
        passwordMeetsCriteria: {
          minLength: false,
          lowercase: false,
          uppercase: false,
          numbers: false,
          specialCharacters: false,
        },
        passwordCriteriaText: {
          minLength: "Minimum 8 characters.",
          lowercase: "At least one lowercase letter (a-z).",
          uppercase: "At least one uppercase letter (A-Z).",
          numbers: "At least one number (0-9).",
          specialCharacters: "At least one symbol (!@#$%).",
        },
        passwordConfirmationError: "",
      };
    },
    computed: {
      isPasswordStrongEnough() {
        return this.passwordStrengthLevel >= 5 && Object.values(this.passwordMeetsCriteria).every(status => status);
      },
      isFormValid() {
        const passwordsMatch = this.form.password === this.form.confirmPassword;
        const basicFieldsFilled = this.form.firstName &&
                       this.form.lastName &&
                       this.form.numeroTel &&
                       this.form.password &&
                       this.form.confirmPassword;

        return basicFieldsFilled && passwordsMatch && this.isPasswordStrongEnough;
      },
      passwordStrengthLevelText() {
        const levels = [
          { text: "Empty", color: "text-gray-500" },
          { text: "Very Weak", color: "text-red-500" },
          { text: "Weak", color: "text-orange-500" },
          { text: "Medium", color: "text-yellow-500" },
          { text: "Strong", color: "text-blue-500" },
          { text: "Very Strong", color: "text-green-600" },
        ];
        const levelIndex = Math.max(0, Math.min(this.passwordStrengthLevel, levels.length - 1));
        return levels[levelIndex];
      },
      passwordSegments() {
        const colors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
        return Array(5).fill(null).map((_, index) => {
          const isActive = index < this.passwordStrengthLevel;
          const colorClass = isActive ? colors[this.passwordStrengthLevel] : colors[0];
          return { class: colorClass };
        });
      }
    },
    created() {
      const routeEmail = this.$route.params.email;

      if (routeEmail) {
        this.registrationEmail = decodeURIComponent(routeEmail);
      } else {
        this.routeError = "The email address is missing in the URL. Unable to register.";
      }
    },
    methods: {
      togglePasswordVisibility(field) {
        if (field === 'password') {
            this.showPassword = !this.showPassword;
        } else if (field === 'confirmPassword') {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
      },
      checkPasswordStrength() {
        this.passwordMeetsCriteria = { minLength: false, lowercase: false, uppercase: false, numbers: false, specialCharacters: false };
        let score = 0;
        const p = this.form.password;

        if (!p) { this.passwordStrengthLevel = 0; this.validatePasswordConfirmation(); return; }

        if (p.length >= 8) { this.passwordMeetsCriteria.minLength = true; score++; }
        if (/[a-z]/.test(p)) { this.passwordMeetsCriteria.lowercase = true; score++; }
        if (/[A-Z]/.test(p)) { this.passwordMeetsCriteria.uppercase = true; score++; }
        if (/\d/.test(p)) { this.passwordMeetsCriteria.numbers = true; score++; }
        if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) { this.passwordMeetsCriteria.specialCharacters = true; score++; }
        
        this.passwordStrengthLevel = score;
        this.validatePasswordConfirmation();
      },
      validatePasswordConfirmation() {
        if (this.form.confirmPassword && this.form.password !== this.form.confirmPassword) {
            this.passwordConfirmationError = "Passwords do not match.";
        } else {
            this.passwordConfirmationError = "";
        }
      },
      async register() {
        this.error = null; 
        this.validatePasswordConfirmation();

        if (!this.registrationEmail) {
          this.error = "Error: Unable to determine the email for registration.";
          return;
        }

        if (!this.isFormValid) {
           if (!this.isPasswordStrongEnough && this.form.password) {
             this.error = "The password is not strong enough. Please meet all criteria.";
           } else if (this.form.password !== this.form.confirmPassword && this.form.confirmPassword) {
             this.error = "Passwords do not match.";
           } else {
              this.error = "Please fill in all required fields and ensure the password is valid.";
           }
          this.isLoading = false;
          return;
        }
        
        this.isLoading = true;
        this.successMessage = null;

        const payload = {
          lastName: this.form.lastName,
          firstName: this.form.firstName,
          numeroTel: this.form.numeroTel,
          password: this.form.password,
        };

        try {
           await axios.post(`/protected-resource/Authen/${encodeURIComponent(this.registrationEmail)}/Registre`, payload).then(()=>{
             this.successMessage = "Registration successful! You will be redirected to the login page.";
             setTimeout(() => {
               this.$router.push('/login');
             }, 2500);
           }).catch((axiosError)=>{
             console.error("Registration API Error:", axiosError.response || axiosError);
             if (axiosError.response && axiosError.response.data) {
                 this.error = axiosError.response.data.message || axiosError.response.data.title || `Error ${axiosError.response.status}: Registration failed.`;
             } else if (axiosError.message && axiosError.message.includes('Network Error')) {
                 this.error = "Network error. Please check your connection.";
             }
             else {
                 this.error = `User ${this.registrationEmail} was not found or an error occurred. Please try creating an account again.`;
             }
             
             if (axiosError.response && (axiosError.response.status === 404 || axiosError.response.status === 400)) {
                 setTimeout(() => {
                     this.$router.push('/signup');
                 }, 3500);
             }
             this.isLoading = false;
           });
        } catch (err) { 
          console.error("Generic Registration Error:", err);
          this.error = "An unexpected error occurred during registration.";
          this.isLoading = false;
        }
      },
    },
  };
</script>

<style scoped>
  .flex-auto {
    transition: background-color 0.3s ease-in-out;
  }
</style>