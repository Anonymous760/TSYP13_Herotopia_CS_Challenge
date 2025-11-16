<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-2xl w-full bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg space-y-8 border border-gray-200"
    >
      <div class="text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800">
          Change Your Password
        </h2>
      </div>

      <div
        v-if="statusMessage"
        :class="[
          'p-3 rounded-md text-center text-sm font-medium shadow-sm',
          statusType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800',
        ]"
      >
        {{ statusMessage }}
      </div>

      <form @submit.prevent="changePassword" class="space-y-6">
        <div>
          <label
            for="current-password"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Current Password</label
          >
          <div class="relative">
            <input
              id="current-password"
              name="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              required
              v-model="currentPassword"
              class="form-input pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="togglePasswordVisibility('current')"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
              aria-label="Show/Hide Current Password"
            >
              <svg v-if="!showCurrentPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" />
              </svg>
            </button>
          </div>
          <div class="text-right mt-1">
            <router-link
              to="/forgot-password"
              class="text-xs font-medium text-[#3498DB] hover:text-[#2980B9] hover:underline"
            >
              Forgot Password?
            </router-link>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-t border-gray-200 pt-6"
        >
          <div class="space-y-3">
            <label
              for="new-password"
              class="block text-sm font-medium text-gray-700"
              >New Password</label
            >
            <div class="relative">
              <input
                id="new-password"
                name="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                required
                v-model="password"
                @input="checkPasswordStrength"
                class="form-input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('new')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
                aria-label="Show/Hide New Password"
              >
                <svg v-if="!showNewPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" />
                </svg>
              </button>
            </div>

            <div v-if="password.length > 0">
              <div class="flex mt-2 -mx-1">
                <div
                  v-for="(segment, index) in segments"
                  :key="index"
                  :class="[
                    'h-1.5 flex-auto rounded-full mx-0.5 transition-colors duration-200',
                    segment.class,
                  ]"
                ></div>
              </div>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-xs text-gray-500">Strength:</span>
                <span
                  :class="['text-xs font-semibold', strengthLevelText.color]"
                  >{{ strengthLevelText.text }}</span
                >
              </div>
            </div>

            <div v-if="password.length > 0">
              <h4 class="mt-2 mb-1 text-xs font-semibold text-gray-700">
                The password must contain:
              </h4>
              <ul class="space-y-0.5 text-xs text-gray-500">
                <li
                  v-for="(status, key) in passwordMeetsCriteria"
                  :key="key"
                  :class="[
                    'flex items-center gap-x-1.5 transition-colors duration-200',
                    status ? 'text-green-600' : 'text-gray-400',
                  ]"
                >
                  <svg
                    v-if="status"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>{{ criteriaText[key] }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-3">
            <label
              for="confirm-password"
              class="block text-sm font-medium text-gray-700"
              >Confirm Password</label
            >
            <div class="relative">
              <input
                id="confirm-password"
                name="confirmPassword"
                :type="showConfirmNewPassword ? 'text' : 'password'"
                required
                v-model="confirmPassword"
                @input="validatePassword"
                class="form-input pr-10"
                placeholder="••••••••"
              />
               <button
                type="button"
                @click="togglePasswordVisibility('confirm')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none z-20"
                aria-label="Show/Hide Password Confirmation"
              >
                <svg v-if="!showConfirmNewPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .962-3.074 3.54-5.547 6.57-6.616M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.953 3.975A12.002 12.002 0 0021.542 12C20.268 7.943 16.477 5 12 5c-.582 0-1.153.048-1.71.138M3.464 5.964A9.963 9.963 0 002.458 12M3 3l18 18" />
                </svg>
              </button>
            </div>
            <p v-if="errorMessage" class="mt-1 text-xs text-red-600">
              {{ errorMessage }}
            </p>
          </div>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60"
            :class="
              isPasswordValidAndConfirmed
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                : 'bg-gray-400 cursor-not-allowed'
            "
            :disabled="isLoading || !isPasswordValidAndConfirmed"
          >
            <span
              class="absolute left-0 inset-y-0 flex items-center pl-3"
              v-if="isLoading"
            >
              <svg
                class="h-5 w-5 text-gray-100 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span v-if="isLoading">Modifying...</span>
            <span v-else>Change Password</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script>
import instance from "../util/axios";

export default {
  name: "Password",
  data() {
    return {
      currentPassword: "",
      password: "",
      confirmPassword: "",
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmNewPassword: false,
      errorMessage: "",
      strengthLevel: 0,
      isLoading: false,
      statusMessage: "",
      statusType: "error",
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
        specialCharacters: "Contains symbols (!@#...).",
      },
    };
  },
  computed: {
    strengthLevelText() {
      const levels = [
        { text: "Empty", color: "text-gray-500" },
        { text: "Very Weak", color: "text-red-500" },
        { text: "Weak", color: "text-orange-500" },
        { text: "Medium", color: "text-yellow-500" },
        { text: "Strong", color: "text-blue-500" },
        { text: "Very Strong", color: "text-green-600" },
      ];
      const levelIndex = Math.max(
        0,
        Math.min(this.strengthLevel, levels.length - 1)
      );
      return levels[levelIndex];
    },
    segments() {
      const colors = [
        "bg-gray-200",
        "bg-red-400",
        "bg-orange-400",
        "bg-yellow-400",
        "bg-blue-400",
        "bg-green-500",
      ];
      return Array(5)
        .fill(null)
        .map((_, index) => {
          const isActive = index < this.strengthLevel;
          const colorClass = isActive ? colors[this.strengthLevel] : colors[0];
          return { class: colorClass + " opacity-100" };
        });
    },
    isPasswordStrongEnough() {
      return (
        this.strengthLevel >= 3 &&
        Object.values(this.passwordMeetsCriteria).every((status) => status)
      );
    },
    isPasswordValidAndConfirmed() {
      return (
        this.currentPassword &&
        this.isPasswordStrongEnough &&
        this.password === this.confirmPassword &&
        !this.errorMessage
      );
    },
  },
  methods: {
    togglePasswordVisibility(fieldType) {
      if (fieldType === 'current') {
        this.showCurrentPassword = !this.showCurrentPassword;
      } else if (fieldType === 'new') {
        this.showNewPassword = !this.showNewPassword;
      } else if (fieldType === 'confirm') {
        this.showConfirmNewPassword = !this.showConfirmNewPassword;
      }
    },
    resetForm() {
      this.currentPassword = "";
      this.password = "";
      this.confirmPassword = "";
      this.errorMessage = "";
      this.strengthLevel = 0;
      this.passwordMeetsCriteria = {
        minLength: false,
        lowercase: false,
        uppercase: false,
        numbers: false,
        specialCharacters: false,
      };
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmNewPassword = false;
    },
    checkPasswordStrength() {
      const pwd = this.password;
      if (!pwd) {
        this.strengthLevel = 0;
        this.passwordMeetsCriteria = {
          minLength: false,
          lowercase: false,
          uppercase: false,
          numbers: false,
          specialCharacters: false,
        };
        this.validatePassword();
        return;
      }

      this.passwordMeetsCriteria = {
        minLength: pwd.length >= 8,
        lowercase: /[a-z]/.test(pwd),
        uppercase: /[A-Z]/.test(pwd),
        numbers: /[0-9]/.test(pwd),
        specialCharacters: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      };
      this.strengthLevel = Object.values(this.passwordMeetsCriteria).filter(
        Boolean
      ).length;

      this.validatePassword();
    },
    validatePassword() {
      if (this.confirmPassword && this.password !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
      } else {
        this.errorMessage = "";
      }
    },
    async changePassword() {
      this.statusMessage = "";
      this.isLoading = true;

      if (!this.currentPassword) {
        this.statusMessage = "Please enter your current password.";
        this.statusType = "error";
        this.isLoading = false;
        return;
      }
      if (!this.password || !this.confirmPassword) {
        this.statusMessage = "Please enter and confirm the new password.";
        this.statusType = "error";
        this.isLoading = false;
        return;
      }
       this.validatePassword();
      if (this.errorMessage) {
        this.statusMessage = this.errorMessage;
        this.statusType = "error";
        this.isLoading = false;
        return;
      }
      if (!this.isPasswordStrongEnough) {
        this.statusMessage = "The new password is not strong enough. Please meet all the criteria.";
        this.statusType = "error";
        this.isLoading = false;
        return;
      }


      const dataToSend = {
        currentPassword: this.currentPassword,
        newPassword: this.password,
      };


      try {
        const response = await instance.post(
          "/protected-resource/User/ChangePasword",
          dataToSend
        );


        if (response.status === 200 || response.status === 204) {
          this.statusMessage = "Your password has been changed successfully.";
          this.statusType = "success";
          this.resetForm();
        } else {
          throw new Error(`Unexpected API status: ${response.status}`);
        }
      } catch (error) {
        this.statusType = "error";
        if (error.response) {
          if (error.response.status === 400) {
            this.statusMessage = `Change failed: ${
              error.response.data?.message ||
              "Incorrect current password or invalid new password."
            }`;
          } else if (error.response.status === 401) {
            this.statusMessage = "Unauthorized. Please log in again.";
          } else {
            this.statusMessage = `Server error (${error.response.status}). Unable to change password.`;
          }
        } else if (error.request) {
          this.statusMessage =
            "Network error. Unable to contact the server.";
        } else {
          this.statusMessage = "A technical error occurred.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
<style scoped>
.form-input {
  /* This uses Tailwind CSS classes as comments to explain the styling */
  /* @apply block w-full py-2.5 sm:py-3 px-4 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400; */
  /* @apply focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3498DB] focus:border-[#3498DB]; */
  /* @apply transition duration-150 ease-in-out; */

  display: block;
  width: 100%;
  padding-top: 0.625rem; /* py-2.5 */
  padding-bottom: 0.625rem; /* py-2.5 */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  border-width: 1px;
  border-color: #d1d5db; /* gray-300 */
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.875rem; /* text-sm */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  color: #9ca3af; /* placeholder-gray-400 */

  /* Focus Styles */
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  --tw-ring-color: #3498DB; /* focus:ring-[#3498DB] */
  border-color: #3498DB; /* focus:border-[#3498DB] */

  /* Transition */
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-in-out */
  transition-duration: 150ms; /* duration-150 */
}
</style>