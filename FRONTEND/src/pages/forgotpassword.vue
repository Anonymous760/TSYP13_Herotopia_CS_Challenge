<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="mb-8">
      <router-link to="/" class="flex justify-center">
        <span class="text-5xl sm:text-6xl font-bold text-[#0a2a6b] hover:text-[#2980B9] transition-colors duration-200">
          UtopiaHire
        </span>
      </router-link>
    </div>

    <div class="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
      <div v-if="step === 'request'">
        <h2 class="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6">Forgot Password?</h2>

        <div v-if="emailFromToken && !isLoading" class="mb-6 text-center">
          <p class="text-sm text-gray-600">
            We're using the email address associated with your current account to send the reset code:
          </p>
          <p class="font-medium text-gray-800 mt-1 break-words">{{ email }}</p>
        </div>

        <div v-if="emailFromToken && isLoading" class="mb-6 text-center">
          <p class="text-sm text-blue-600 mt-2">Sending reset code to {{ email }}...</p>
          <div class="flex justify-center mt-4">
            <svg class="animate-spin h-6 w-6 text-[#3498DB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
          </div>
        </div>

        <p v-if="!emailFromToken" class="text-sm text-center text-gray-600 mb-6">
          Enter your email address below. We'll send you a code to reset your password.
        </p>

        <div v-if="statusMessage" :class="['p-3 mb-4 rounded-md text-center text-sm font-medium shadow-sm break-words', statusType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800']">
          {{ statusMessage }}
        </div>

        <form v-if="!emailFromToken" @submit.prevent="requestPasswordReset" class="space-y-5">
          <div>
            <label for="email-request" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              id="email-request"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="form-input"
              placeholder="example@domain.com"
              :disabled="isLoading"
            />
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60 bg-[#0a2a6b] hover:bg-[#2980B9] focus:ring-[#3498DB]"
              :disabled="isLoading || !email"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
              {{ isLoading ? 'Sending...' : 'Send Code' }}
            </button>
          </div>
        </form>

        <div class="mt-4 text-center">
          <router-link to="/login" class="text-sm font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline">
            Back to login
          </router-link>
        </div>
      </div>

      <div v-if="step === 'verify'">
        <h3 class="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-2">Verify your identity</h3>
        <p class="text-sm text-center text-gray-600 mb-5 break-words">
          A code has been sent to <span class="font-medium">{{ email }}</span>. Please enter it below.
        </p>

        <div v-if="statusMessage" :class="['p-3 mb-4 rounded-md text-center text-sm font-medium shadow-sm break-words', statusType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800']">
          {{ statusMessage }}
        </div>

        <div class="flex gap-x-2 sm:gap-x-3 justify-center mb-5">
          <input
            v-for="(input, index) in pinValues"
            :key="`pin-${index}`"
            v-model="pinValues[index]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="block w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-medium focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB] disabled:opacity-50 disabled:pointer-events-none"
            :autofocus="index === 0"
            maxlength="1"
            @input="handlePinInput($event, index)"
            @keydown="handlePinKeydown($event, index)"
            ref="pinInputs"
            :disabled="isLoading"
          />
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="verifyOtp"
            :disabled="!isPinComplete || isLoading"
            class="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 bg-[#2ECC71] text-white rounded-md shadow-sm hover:bg-[#27ae60] disabled:opacity-60 transition duration-150 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2ECC71]"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
            {{ isLoading ? 'Verifying...' : 'Verify Code' }}
          </button>
          <button
            @click="goBackToRequest"
            :disabled="isLoading"
            class="w-full sm:w-auto inline-flex justify-center py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition duration-150 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Back
          </button>
        </div>
        <div class="mt-4 text-center">
          <button @click="requestPasswordReset" :disabled="isLoading || isResendLoading" class="text-xs font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline disabled:opacity-60 disabled:cursor-not-allowed">
            <svg v-if="isResendLoading" class="animate-spin inline mr-1 h-3 w-3 text-[#3498DB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
            {{ isResendLoading ? 'Resending...' : 'Resend Code?' }}
          </button>
        </div>
      </div>

      <div v-if="step === 'reset'">
        <h2 class="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6">Set a New Password</h2>

        <div v-if="statusMessage && !resetSuccess" :class="['p-3 mb-4 rounded-md text-center text-sm font-medium shadow-sm break-words', statusType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800']">
          {{ statusMessage }}
        </div>

        <div v-if="resetSuccess" class="text-center space-y-4">
          <p class="text-green-700 font-medium">Your password has been successfully reset!</p>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <router-link to="/login" class="inline-flex justify-center py-2.5 px-6 bg-[#3498DB] text-white rounded-md shadow-sm hover:bg-[#2980B9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3498DB] transition duration-150">
            Log In
          </router-link>
        </div>

        <form v-if="!resetSuccess" @submit.prevent="setNewPassword" class="space-y-6">
          <div class="grid grid-cols-1 gap-x-6 gap-y-6">
            <div class="space-y-3">
              <label for="new-password" class="block text-sm font-medium w-full text-gray-700">New Password</label>
              <div class="relative">
                <input 
                  id="new-password" 
                  name="newPassword" 
                  :type="showNewPassword ? 'text' : 'password'" 
                  required 
                  v-model="password" 
                  @input="checkPasswordStrength" 
                  class="form-input w-full pr-10" 
                  placeholder="••••••••" 
                  :disabled="isLoading" 
                />
                <button 
                  type="button" 
                  @click="togglePasswordVisibility('newPassword')" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Show/Hide New Password"
                  :disabled="isLoading"
                >
                  <svg v-if="!showNewPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" /> </svg>
                </button>
              </div>

              <div v-if="password.length > 0">
                <div class="flex mt-2 -mx-1">
                  <div v-for="(segment, index) in segments" :key="index" :class="['h-1.5 flex-auto rounded-full mx-0.5 transition-colors duration-200', segment.class]"></div>
                </div>
                <div class="mt-2 flex justify-between items-center">
                  <span class="text-xs text-gray-500">Strength:</span>
                  <span :class="['text-xs font-semibold', strengthLevelText.color]">{{ strengthLevelText.text }}</span>
                </div>
              </div>

              <div v-if="password.length > 0">
                <h4 class="mt-2 mb-1 text-xs font-semibold text-gray-700">Password must contain:</h4>
                <ul class="space-y-0.5 text-xs text-gray-500">
                  <li v-for="(status, key) in passwordMeetsCriteria" :key="key" :class="['flex items-center gap-x-1.5 transition-colors duration-200', status ? 'text-green-600' : 'text-gray-400']">
                    <svg v-if="status" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    <span>{{ criteriaText[key] }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="space-y-3">
              <label for="confirm-password" class="block text-sm font-medium w-full text-gray-700">Confirm Password</label>
              <div class="relative">
                <input 
                  id="confirm-password" 
                  name="confirmPassword" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  required 
                  v-model="confirmPassword" 
                  @input="validatePassword" 
                  class="form-input w-full pr-10" 
                  placeholder="••••••••" 
                  :disabled="isLoading" 
                />
                  <button 
                  type="button" 
                  @click="togglePasswordVisibility('confirmPassword')" 
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Show/Hide Confirm Password"
                  :disabled="isLoading"
                >
                  <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> </svg>
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" /> </svg>
                </button>
              </div>
              <p v-if="confirmationErrorMessage" class="mt-1 text-xs text-red-600">
                {{ confirmationErrorMessage }}
              </p>
            </div>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60"
              :class="isPasswordValidAndConfirmed ? 'bg-[#2ECC71] hover:bg-[#27ae60] focus:ring-[#2ECC71]' : 'bg-gray-400 cursor-not-allowed'"
              :disabled="isLoading || !isPasswordValidAndConfirmed"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
              {{ isLoading ? 'Saving...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import instance from "../util/axios";
import { jwtDecode } from 'jwt-decode';

export default defineComponent({
  name: "ForgotPasswordFlow",
  data() {
    return {
      step: 'request',
      email: '',
      emailFromToken: false,
      pinValues: Array(4).fill(''),
      password: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      confirmationErrorMessage: '',
      strengthLevel: 0,
      isLoading: false,
      isResendLoading: false,
      statusMessage: '',
      statusType: 'error',
      resetSuccess: false,
      passwordMeetsCriteria: {
        minLength: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        specialCharacters: false,
      },
      criteriaText: {
        minLength: "Minimum 8 characters.",
        lowercase: "Contains lowercase letters (a-z).",
        uppercase: "Contains uppercase letters (A-Z).",
        numbers: "Contains numbers (0-9).",
        specialCharacters: "Contains symbols (!@#$%).",
      },
    };
  },
  computed: {
    isPinComplete() {
      return this.pinValues.every(val => val && /^[0-9]$/.test(val));
    },
    strengthLevelText() {
      const levels = [
        { text: "Empty", color: "text-gray-500" },
        { text: "Very Weak", color: "text-red-500" },
        { text: "Weak", color: "text-orange-500" },
        { text: "Medium", color: "text-yellow-500" },
        { text: "Strong", color: "text-blue-500" },
        { text: "Very Strong", color: "text-green-600" },
      ];
      const levelIndex = Math.max(0, Math.min(this.strengthLevel, levels.length - 1));
      return levels[levelIndex];
    },
    segments() {
      const colors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
      return Array(5).fill(null).map((_, index) => {
        const isActive = index < this.strengthLevel;
        const colorClass = isActive ? colors[this.strengthLevel] : colors[0];
        return { class: colorClass };
      });
    },
    isPasswordStrongEnough() {
      return this.strengthLevel >= 5 && Object.values(this.passwordMeetsCriteria).every(status => status);
    },
    isPasswordValidAndConfirmed() {
      return this.isPasswordStrongEnough && this.password === this.confirmPassword && !this.confirmationErrorMessage;
    },
  },
  methods: {
    togglePasswordVisibility(fieldType) {
      if (fieldType === 'newPassword') {
        this.showNewPassword = !this.showNewPassword;
      } else if (fieldType === 'confirmPassword') {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    async requestPasswordReset() {
      if (this.isLoading && !this.isResendLoading) return;
      if (!this.email) {
        this.statusMessage = "Email address is required to send a code.";
        this.statusType = 'error';
        this.emailFromToken = false;
        return;
      }

      this.statusMessage = '';
      if (this.step === 'verify') { this.isResendLoading = true; }
      else { this.isLoading = true; }


      try {
        const apiUrl = `/protected-resource/Otp/addPassOtp/${encodeURIComponent(this.email)}`;
        const response = await instance.post(apiUrl, {});

        if (response.status >= 200 && response.status < 300) {
          this.statusMessage = `Code successfully sent to ${this.email}. Check your inbox.`;
          this.statusType = 'success';
          this.pinValues = Array(this.pinValues.length).fill('');
          if (this.step !== 'verify') {
            this.step = 'verify';
            this.$nextTick(() => { 
              const firstPinInput = this.$refs.pinInputs?.[0];
              if (firstPinInput) {
                firstPinInput.focus();
              }
            });
          }
        } else {
          throw new Error(`API returned an unexpected status: ${response.status}`);
        }

      } catch (error) {
        this.statusType = 'error';
        if (error.response) {
          this.statusMessage = error.response.data?.message || `Error ${error.response.status}: Failed to send code. Check address or try again later.`;
          if (this.emailFromToken && (error.response.status === 400 || error.response.status === 404)) {
            this.statusMessage += " The email address from the current account appears invalid. Please enter it manually.";
            this.emailFromToken = false;
            this.email = '';
            this.step = 'request';
          }
        } else if (error.request) {
          this.statusMessage = "Network error: Unable to reach the server. Check your connection.";
        } else {
          this.statusMessage = `An error occurred: ${error.message || 'Unknown error'}`;
        }
      } finally {
        this.isLoading = false;
        this.isResendLoading = false;
      }
    },

    goBackToRequest() {
      this.step = 'request';
      this.statusMessage = '';
      this.pinValues = Array(this.pinValues.length).fill('');
    },

    handlePinInput(event, index) {
      const input = event.target;
      let value = input.value;

      if (!/^[0-9]$/.test(value) && value !== '') {
        this.pinValues[index] = '';
        this.$nextTick(() => input.select());
        return;
      }

      this.pinValues[index] = value;

      if (value && index < this.pinValues.length - 1) {
        this.$nextTick(() => { 
            const nextPinInput = this.$refs.pinInputs?.[index + 1];
            if (nextPinInput) {
                nextPinInput.focus();
            }
        });
      }
      this.clearStatusMessage();
    },

    handlePinKeydown(event, index) {
      if (event.key === 'Backspace') {
        event.preventDefault();
        if (this.pinValues[index]) {
          this.pinValues[index] = '';
        } else if (index > 0) {
            const prevPinInput = this.$refs.pinInputs?.[index - 1];
            if (prevPinInput) {
                prevPinInput.focus();
            }
        }
        this.clearStatusMessage();
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        const prevPinInput = this.$refs.pinInputs?.[index - 1];
        if (prevPinInput) {
            prevPinInput.focus();
        }
      }
      if (event.key === 'ArrowRight' && index < this.pinValues.length - 1) {
        const nextPinInput = this.$refs.pinInputs?.[index + 1];
        if (nextPinInput) {
            nextPinInput.focus();
        }
      }
      if (event.key === 'Enter' && this.isPinComplete) {
        this.verifyOtp();
      }
    },

    clearStatusMessage() {
      if (this.statusMessage) { this.statusMessage = ''; }
    },

    async verifyOtp() {
      if (!this.isPinComplete || this.isLoading) return;
      this.statusMessage = '';
      this.isLoading = true;
      const otp = this.pinValues.join('');

      try {
        const apiUrl = `/protected-resource/Otp/verify/${encodeURIComponent(this.email)}/Passotp/${otp}`;
        const response = await instance.get(apiUrl);

        if (response.status >= 200 && response.status < 300) {
          this.step = 'reset';
          this.statusMessage = '';
          this.password = '';
          this.confirmPassword = '';
          this.confirmationErrorMessage = '';
          this.checkPasswordStrength();
        } else {
          throw new Error(response.data?.message || `Verification failed (status ${response.status})`);
        }

      } catch (error) {
        this.statusType = 'error';
        if (error.response) {
          this.statusMessage = error.response.data?.message || `Incorrect or expired code (Error ${error.response.status}). Please try again or request a new code.`;
        } else if (error.request) {
          this.statusMessage = "Network error during verification. Check your connection.";
        } else {
          this.statusMessage = `Verification error: ${error.message || 'Unknown error.'}`;
        }
        this.pinValues = Array(this.pinValues.length).fill('');
        this.$nextTick(() => { 
            const firstPinInput = this.$refs.pinInputs?.[0];
            if (firstPinInput) {
                firstPinInput.focus();
            }
        });
      } finally {
        this.isLoading = false;
      }
    },

    checkPasswordStrength() {
      this.passwordMeetsCriteria = { minLength: false, lowercase: false, uppercase: false, numbers: false, specialCharacters: false };
      let score = 0;
      const p = this.password;

      if (!p) { this.strengthLevel = 0; this.validatePassword(); return; }

      if (p.length >= 8) { this.passwordMeetsCriteria.minLength = true; score++; }
      if (/[a-z]/.test(p)) { this.passwordMeetsCriteria.lowercase = true; score++; }
      if (/[A-Z]/.test(p)) { this.passwordMeetsCriteria.uppercase = true; score++; }
      if (/\d/.test(p)) { this.passwordMeetsCriteria.numbers = true; score++; }
      // The original regex was complex. Simplified to match the French text description: symbols (!@#$%).
      if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) { this.passwordMeetsCriteria.specialCharacters = true; score++; }

      this.strengthLevel = score;
      this.validatePassword();
    },

    validatePassword() {
      if (this.confirmPassword && this.password !== this.confirmPassword) {
        this.confirmationErrorMessage = "Passwords do not match.";
      } else {
        this.confirmationErrorMessage = '';
      }
    },

    async setNewPassword() {
      this.statusMessage = '';
      if (!this.isPasswordValidAndConfirmed) {
        if (!this.isPasswordStrongEnough && this.password) {
            this.statusMessage = "The password is not strong enough. Please meet all criteria.";
        } else if (this.password !== this.confirmPassword) {
            this.statusMessage = "Passwords do not match.";
        } else {
            this.statusMessage = "Please ensure the password meets all criteria and the confirmation is correct.";
        }
        this.statusType = 'error';
        return;
      }
      this.isLoading = true;

      try {
        const resetApiUrl = '/protected-resource/User/newpassword';
        const payload = {
          email: this.email,
          newpass: this.password,
        };
        const response = await instance.put(resetApiUrl, payload);

        if (response.status >= 200 && response.status < 300) {
          if (response.data && response.data.message) {
              this.statusMessage = response.data.message;
          } else {
              this.statusMessage = "Your password has been successfully reset!";
          }
          this.statusType = 'success';
          this.resetSuccess = true;
        } else {
          throw new Error(response.data?.message || `Reset failed (status ${response.status})`);
        }

      } catch (error) {
        this.statusType = 'error';
        if (error.response) {
          console.error("API Error Response:", error.response);
          this.statusMessage = error.response.data?.message || 
                               (error.response.data?.title && typeof error.response.data.title === 'string' ? error.response.data.title : null) || 
                               `Could not reset password (Error ${error.response.status}). The link or code may have expired.`;
        } else if (error.request) {
          this.statusMessage = "Network error or server did not respond.";
        } else {
          this.statusMessage = `Reset error: ${error.message || 'Unknown error.'}`;
        }
        this.resetSuccess = false;
      } finally {
        this.isLoading = false;
      }
    },

    getEmailFromToken(token) {
      try {
        const decoded = jwtDecode(token);
        const emailClaimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
        const email = decoded[emailClaimKey];

        if (email && typeof email === 'string') {
          return email;
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    }
  },
  async created() {
    const token = localStorage.getItem("authToken");

    if (token) {
      const extractedEmail = this.getEmailFromToken(token);

      if (extractedEmail) {
        this.email = extractedEmail;
        this.emailFromToken = true;
        this.step = 'request';
        // Automatically attempt to send the code if a token with email is found
        await this.requestPasswordReset();
      } else {
        this.step = 'request';
        this.emailFromToken = false;
      }
    } else {
      this.step = 'request';
      this.emailFromToken = false;
    }
  },
});
</script>

<style scoped>
.form-input {
  @apply block w-full py-2.5 sm:py-3 px-4 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB];
  @apply transition duration-150 ease-in-out disabled:opacity-50 disabled:pointer-events-none disabled:bg-gray-50;
}

.flex input[type="text"].block {
  @apply focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB];
}

button:not([disabled]).bg-\[\#3498DB\] {
  @apply hover:bg-[#2980B9];
}

button:not([disabled]).bg-\[\#2ECC71\] {
  @apply hover:bg-[#27ae60];
}

.flex-auto {
  transition: background-color 0.3s ease-in-out;
}

.break-words {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}
</style>