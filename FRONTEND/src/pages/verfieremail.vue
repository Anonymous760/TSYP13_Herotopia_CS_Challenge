<template>
  <div class="email-verification">
    <h2>Email Verification</h2>
    <div v-if="loading" class="loading">Verifying your email...</div>
    <div v-else>
      <div v-if="verificationSuccess">
        <p>Your email has been successfully verified!</p>
      </div>
      <div v-else>
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <p v-else>Error: Verification failed. Please try again later.</p>
      </div>
    </div>
  </div>
</template>

<script>
//import axios from "../util/axios.js";
import instance from "../util/axios.js";
import axios from "axios";

export default {
  data() {
    return {
      loading: true,
      verificationSuccess: false,
      errorMessage: null,
    };
  },
  created() {
    const email = this.$route.query.email;
    const token = this.$route.query.token;

    if (email && token) {
      this.verifyEmail(email, token);
    } else {
      this.verificationSuccess = false;
      this.loading = false;
    }
  },
  methods: {
    async verifyEmail(email, token) {
      console.log("Token:", token);
      try {
        
        const encodedEmail = encodeURIComponent(email);
const encodedToken = encodeURIComponent(token);

        const response = await instance.get(
          `/protected-resource/Authen/ConfirmEmail?email=${encodedEmail}&token=${encodedToken}`
        );

        if (response.status === 200 ) {
          this.verificationSuccess = true;

          
            this.$router.push(`/registre/${email}`);
         
        } else {
          this.verificationSuccess = false;
          this.errorMessage = response.data.message || "Verification failed. Please try again later.";
        }
      } catch (error) {
        console.error("Error during verification:", error);
        this.verificationSuccess = false;
        this.errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
