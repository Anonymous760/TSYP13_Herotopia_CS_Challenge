<template>
  <div class="flex h-screen flex-col bg-gray-100">

    <div class="fixed top-0 left-0 right-0 z-30 h-16">
      <Navigation @toggle-sidebar="openNavModal" />
    </div>

    <div class="mt-16 flex flex-1 overflow-hidden">

      

       <NavModal v-if="isNavModalOpen" :is-open="isNavModalOpen" @close="closeNavModal" class="z-50"/>

       <main class="relative z-10 flex-1 overflow-y-auto bg-gray-50 ">
          <div class="">
              <router-view v-slot="{ Component, route }">
                 <component :is="Component" :key="route.fullPath" />
              </router-view>
          </div>
       </main>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Navigation from "./Navigation.vue";

import NavModal from "./NavModal.vue";

const isNavModalOpen = ref(false);
const route = useRoute();

const openNavModal = () => { isNavModalOpen.value = true; };
const closeNavModal = () => { isNavModalOpen.value = false; };

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && isNavModalOpen.value) {
      closeNavModal();
    }
  }
);
</script>

<style scoped>
</style>