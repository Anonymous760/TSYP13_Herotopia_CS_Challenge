<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Titre déplacé à l'intérieur de la div principale ci-dessous -->
    <div v-if="isFetching" class="text-center py-10">
      <svg class="animate-spin h-8 w-8 text-[#3498DB] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-2 text-sm text-gray-600">Chargement de vos informations...</p>
    </div>

    <div v-else class="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
      <h1 class="text-center text-3xl font-bold text-gray-800 mb-8"> 
        Mes informations personnelles
      </h1>

      <form @submit.prevent="saveChanges">

        <div v-if="statusMessage" :class="['mb-6 text-sm text-center p-3 rounded-md border', statusType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200']">
           {{ statusMessage }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">

          <div>
            <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              id="prenom"
              class="form-input"
              placeholder="Votre prénom"
              :disabled="!isEditing"
              :class="{ 'form-input-disabled': !isEditing }"
              v-model.trim="formData.prenom"
              required
            />
          </div>

          <div>
            <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              id="nom"
              class="form-input"
              placeholder="Votre nom"
              :disabled="!isEditing"
              :class="{ 'form-input-disabled': !isEditing }"
              v-model.trim="formData.nom"
              required
            />
          </div>

          <div class="md:col-span-2">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              class="form-input w-full"
              placeholder="Votre adresse e-mail"
              :disabled="!isEditing"
              :class="{ 'form-input-disabled': !isEditing }"
              v-model.trim="formData.email"
              required
              aria-describedby="email-hint"
            />
          </div>

          <div>
            <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div class="flex rounded-lg shadow-sm border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden"
                 :class="{'bg-gray-100 border-gray-200 cursor-not-allowed' : !isEditing}" >
              <span class="inline-flex items-center px-3 border-r border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                <img width="20" height="20" src="https://img.icons8.com/color/48/tunisia.png" alt="TN Flag" />
                <span class="ml-1.5 font-medium text-gray-600">+216</span>
              </span>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                class="flex-1 block w-full rounded-none rounded-r-lg sm:text-sm py-3 px-4 border-0 focus:ring-0 focus:outline-none"
                placeholder="XX XXX XXX"
                :disabled="!isEditing"
                :class="{'bg-gray-100 cursor-not-allowed': !isEditing, 'bg-white': isEditing}"
                pattern="[0-9]{8}"
                title="Veuillez entrer 8 chiffres."
                maxlength="8"
                v-model.trim="formData.telephone"
                required
              />
            </div>
             <p v-if="isEditing" class="mt-1 text-xs text-gray-500">Entrez les 8 chiffres (ex: 98123456).</p>
          </div>

        </div>

        <div class="flex flex-col sm:flex-row justify-end sm:space-x-3 border-t border-gray-200 pt-6 mt-6">
          <button
             v-if="isEditing"
             type="button"
             @click="cancelEdit"
             class="order-2 sm:order-1 mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150"
             :disabled="isSaving"
          >
            Annuler
          </button>
          <button
            type="button"
            @click="toggleEditOrSave"
            class="order-1 sm:order-2 w-full sm:w-auto inline-flex justify-center items-center py-2 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 disabled:opacity-70"
             :class="[ isEditing ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-[#3498DB] hover:bg-[#2980B9] focus:ring-[#3498DB]' ]"
             :disabled="isSaving"
          >
              <svg v-if="isSaving && isEditing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
             {{ buttonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
// import instance from "../util/axios"; // Supposons que c'est votre instance principale si utilisée ailleurs
import instance from "../util/axios"; // Utilisez ceci si c'est l'instance configurée avec le token

export default {
  name: "Information",
  data() {
    return {
      isEditing: false,
      isFetching: false,
      isSaving: false,
      statusMessage: '',
      statusType: '',
      originalData: {
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
      },
      formData: {
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
      },
    };
  },
  computed: {
    buttonText() {
      if (this.isEditing) {
        return this.isSaving ? 'Enregistrement...' : 'Enregistrer';
      }
      return 'Modifier';
    }
  },
   mounted() {
      this.fetchUserInfo();
   },
  methods: {
     async fetchUserInfo() {
        this.isFetching = true;
        this.statusMessage = '';
        this.statusType = '';
        try {
            const response = await instance.get('/protected-resource/User');
            if (response.data) {
                const fetchedData = {
                    prenom: response.data.firstName || '',
                    nom: response.data.lastName || '',
                    email: response.data.email || '',
                    telephone: (response.data.phoneNumber || '').replace('+216', '').trim(),
                };
                this.formData = { ...fetchedData };
                this.originalData = { ...fetchedData };
            } else {
                 throw new Error("Aucune donnée utilisateur reçue de l'API.");
            }
        } catch (error) {
            this.statusMessage = "Impossible de charger vos informations personnelles.";
            if (error.response) {
                 this.statusMessage += ` (Erreur ${error.response.status})`;
            } else if (error.request) {
                 this.statusMessage += " Le serveur n'a pas répondu.";
            } else {
                 this.statusMessage += ` Erreur: ${error.message}`;
            }
            this.statusType = 'error';
        } finally {
            this.isFetching = false;
        }
    },

    toggleEditOrSave() {
      if (this.isSaving) return;
      this.statusMessage = '';
      this.statusType = '';
      if (this.isEditing) {
        this.saveChanges();
      } else {
        this.isEditing = true;
         this.$nextTick(() => {
             const firstInput = this.$el.querySelector('input:not([disabled]):not([readonly])');
             if (firstInput) {
                firstInput.focus();
             }
         });
      }
    },

    async saveChanges() {
      if (!this.formData.prenom || !this.formData.nom || !this.formData.email || !this.formData.telephone) {
          this.statusMessage = "Veuillez remplir tous les champs requis.";
          this.statusType = 'error';
          return;
      }
       if (!/^[0-9]{8}$/.test(this.formData.telephone)) {
          this.statusMessage = "Le numéro de téléphone doit contenir exactement 8 chiffres.";
          this.statusType = 'error';
          return;
       }

      this.isSaving = true;
      this.statusMessage = '';
      this.statusType = '';

      const payload = {
          prenom: this.formData.prenom,
          nom: this.formData.nom,
          email: this.formData.email,
          telephone: `+216${this.formData.telephone}`
      };

      try {
          // Utilisez 'axios' ici si c'est votre instance configurée, sinon 'instance'
          const response = await instance.put('/protected-resource/User/updateuser', payload);
          if (response.status === 200 || response.status === 204 || (response.data && response.data.success === true)) {
              this.isEditing = false;
              this.originalData = { ...this.formData };
              this.statusMessage = response.data?.message || 'Informations mises à jour avec succès !';
              this.statusType = 'success';
          } else {
              throw new Error(response.data?.message || `API returned unexpected success status: ${response.status}`);
          }

       } catch (error) {
          this.statusMessage = "Échec de la mise à jour des informations.";
          if (error.response) {
               this.statusMessage += ` Erreur ${error.response.status}: ${error.response.data?.message || error.response.data?.title || error.response.data || 'Veuillez vérifier vos données.'}`;
                 if (error.response.status === 400 && error.response.data && typeof error.response.data === 'object' && error.response.data.errors) {
                    const firstErrorKey = Object.keys(error.response.data.errors)[0];
                    if (firstErrorKey && error.response.data.errors[firstErrorKey].length > 0) {
                        this.statusMessage = error.response.data.errors[firstErrorKey][0];
                    }
                }
          } else if (error.request) {
               this.statusMessage += " Aucune réponse du serveur.";
          } else {
              this.statusMessage += ` Erreur: ${error.message}`;
          }
          this.statusType = 'error';
       } finally {
           this.isSaving = false;
       }
    },

    cancelEdit() {
       if (this.isSaving) return;
       this.isEditing = false;
       this.formData = { ...this.originalData };
       this.statusMessage = '';
       this.statusType = '';
    }
  },
};
</script>

<style scoped>
.form-input {
  @apply block w-full py-3 px-4 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm placeholder-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:border-blue-500;
  @apply transition duration-150 ease-in-out;
}

.form-input-disabled {
  @apply bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed;
}

input[type="tel"]:focus {
    outline: none;
    box-shadow: none;
    border: none; /* Ceci est important pour le champ téléphone customisé */
}
</style>