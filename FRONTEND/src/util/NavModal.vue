<template>
  <Dialog
      :open="isOpen"
      @close="closeModal"
      class="relative z-50 lg:hidden"
  >
    <div class="fixed inset-0 bg-black/30" aria-hidden="true" ></div>

    <div class="fixed inset-y-0 left-0 flex w-full max-w-xs">
      <DialogPanel class="relative flex w-full flex-1 flex-col overflow-y-auto bg-white pb-4 pt-5 shadow-xl">

        <div class="flex flex-shrink-0 items-center px-4">
           <RouterLink to="/home" @click="handleLinkClick" class="flex items-center" aria-label="Go to Homepage">
             <h1 class="text-3xl font-bold text-[#3498DB]">
               <span class="text-4xl sm:text-5xl font-bold text-[#0a2a6b]">
                 UtopiaHire
               </span>
             </h1>
           </RouterLink>
        </div>

        <div class="mt-5 h-0 flex-1 overflow-y-auto px-2">
          <nav class="flex h-full flex-col">
              <ul class="flex-1 space-y-1">
                
                <li class="pt-4 mt-4 border-t border-gray-200">
                    <p class="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        My Account </p>
                    <ul class="mt-1 space-y-1">
                        <li>
                           <RouterLink to="/info" @click="handleLinkClick" class="group flex items-center gap-x-2 rounded-lg py-2 px-2.5 text-sm text-gray-700 hover:bg-gray-100" active-class="router-link-exact-active">
                                <img src="https://i.imgur.com/CYpM8ri.png" class="h-6 w-6 flex-shrink-0 ml-[26px]" alt="Info Icon">
                                My Information </RouterLink>
                        </li>
                         <li>
                           <router-link to="/password" @click="handleLinkClick" class="group flex items-center gap-x-2 rounded-lg py-2 px-2.5 text-sm text-gray-700 hover:bg-gray-100" active-class="router-link-exact-active">
                                <img src="https://i.imgur.com/gFdf3lU.png" class="h-6 w-6 flex-shrink-0 ml-[26px]" alt="Password Icon">
                                Password </router-link>
                         </li>
                         
                    </ul>
                </li>

                <li class="flex-grow"></li>

                <li class="pt-4 border-t border-gray-200 -mx-2">
                   <button
                     @click="handleLogout"
                     class="group flex w-full items-center gap-x-3.5 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                     </svg>
                     Logout </button>
                </li>
              </ul>
          </nav>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup>
import { Dialog, DialogPanel } from '@headlessui/vue';
import { RouterLink, useRouter } from 'vue-router';

const props = defineProps({
isOpen: { type: Boolean, required: true },
});
const emit = defineEmits(['close']);
const router = useRouter();

const closeModal = () => { emit('close'); };

const handleLinkClick = () => {
  closeModal();
};

const handleLogout = () => {
closeModal();
localStorage.removeItem("authToken");
router.push("/");
};
</script>

<style scoped>
.router-link-exact-active {
color: #1f2937;
font-weight: 600;
}
</style>