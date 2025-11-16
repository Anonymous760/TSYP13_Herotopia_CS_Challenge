<template>
  <nav class="h-16 border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4 md:px-6 lg:px-0">
     <RouterLink to="/home" class="flex items-center" aria-label="Go to Homepage">
  <img 
    src="https://i.imgur.com/ljCbl1O.png" 
    alt="Mermaid Logo" 
    class="h-12 sm:h-16" 
  />
</RouterLink>


      <div class="hidden items-center gap-4 lg:flex">

        <div ref="notificationContainer" class="relative">
          <button
            @click="toggleNotificationDropdown"
            type="button"
            class="relative inline-flex items-center rounded-lg p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="View notifications"
            :aria-expanded="isNotificationDropdownOpen"
            id="notification-button"
            aria-haspopup="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span class="sr-only">Notifications</span>
            <div v-if="notifications.length > 0" class="absolute -end-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
              {{ notifications.length }}
            </div>
          </button>
          <div v-if="isNotificationDropdownOpen" class="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="notification-button">
            <p class="px-4 py-2 text-sm font-medium text-gray-900">Notifications</p>
            <ul role="none">
              <li v-if="notifications.length === 0" class="block px-4 py-2 text-sm text-gray-500 text-center" role="none">
                No new notifications </li>
              <li v-for="(notification, index) in notifications" :key="index" role="none">
                <a href="#" @click.prevent="handleNotificationClick(notification, index)" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                  {{ notification }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div ref="profileDropdownContainer" class="relative">
          <button
            @click="toggleProfileDropdown"
            type="button"
            class="flex items-center gap-2 rounded-full p-1 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            aria-label="User menu"
            id="user-menu-button"
            :aria-expanded="isProfileDropdownOpen"
            aria-haspopup="true"
          >
            <span class="inline-flex size-9 items-center justify-center rounded-full bg-[#3498DB] font-semibold text-white">
              {{ initials }}
            </span>
            <span class="hidden sm:inline font-medium text-gray-700">{{ fullName }}</span>
            <svg class="hidden h-5 w-5 text-gray-500 sm:inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div
            v-if="isProfileDropdownOpen"
            class="absolute right-0 top-full z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabindex="-1"
          >
            <div class="border-b border-gray-200 px-4 py-3" role="none">
              <p class="text-sm font-medium text-gray-900" role="none">{{ fullName }}</p>
              <p class="truncate text-xs text-gray-500" role="none">{{ email }}</p>
            </div>
            <ul role="none">
              <li role="none">
                <RouterLink to="/info" @click="closeProfileDropdown" class="group flex items-center gap-x-2 py-2 px-2.5 text-sm text-gray-700 hover:bg-gray-100" :class="{'router-link-exact-active': $route.path === '/info'}" role="menuitem" tabindex="-1">
                  <img src="https://i.imgur.com/CYpM8ri.png" class="h-6 w-6 flex-shrink-0 ml-2" alt="Info Icon">
                  My Information </RouterLink>
              </li>
              <li role="none">
                <RouterLink to="/password" @click="closeProfileDropdown" class="group flex items-center gap-x-2 py-2 px-2.5 text-sm text-gray-700 hover:bg-gray-100" :class="{'router-link-exact-active': $route.path === '/password'}" role="menuitem" tabindex="-1">
                  <img src="https://i.imgur.com/gFdf3lU.png" class="h-6 w-6 flex-shrink-0 ml-2" alt="Password Icon">
                  Password </RouterLink>
              </li>
              
              <li role="none">
                <button @click.prevent="logout" class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" role="menuitem" tabindex="-1">
                  Logout </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex items-center lg:hidden">
        <div ref="mobileNotificationContainer" class="relative">
           <button
             @click="toggleNotificationDropdown"
             type="button"
             class="relative inline-flex items-center rounded-lg p-2 mr-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
             aria-label="View notifications mobile"
             :aria-expanded="isNotificationDropdownOpen"
             aria-haspopup="true"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
             </svg>
             <div v-if="notifications.length > 0" class="absolute -end-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white">
              {{ notifications.length }}
             </div>
             <div v-if="isNotificationDropdownOpen" class="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical">
               <p class="px-4 py-2 text-sm font-medium text-gray-900">Notifications</p>
               <ul role='none'>
                 <li v-if="notifications.length === 0" class="px-4 py-2 text-center text-sm text-gray-500" role='none'>No notifications </li>
                 <li v-for="(notification, index) in notifications" :key="index" role='none'>
                     <a href="#" @click.prevent="handleNotificationClick(notification, index)" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">{{ notification }}</a>
                 </li>
               </ul>
             </div>
           </button>
        </div>

        <button
          @click="$emit('toggle-sidebar')"
          type="button"
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Open main menu"
        >
          <span class="sr-only">Open main menu</span>
          <svg class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import instance from "./axios";

defineEmits(['toggle-sidebar']);
const router = useRouter();

const isProfileDropdownOpen = ref(false);
const isNotificationDropdownOpen = ref(false);
const fullName = ref("");
const email = ref("");
const notifications = ref([]);
const profileDropdownContainer = ref(null);
const notificationContainer = ref(null);
const mobileNotificationContainer = ref(null);

const initials = computed(() => {
    if (!fullName.value) return "?";
    const parts = fullName.value.trim().split(" ");
    if (parts.length === 0 || parts[0] === "") return "?";
    return parts.length >= 2
           ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
           : parts[0].substring(0, 2).toUpperCase();
});

const loadUserInfo = async () => {
    try {
         const response = await instance.get("/protected-resource/User");
         const data = response.data;
         fullName.value = data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}` : "Utilisateur";
         email.value = data?.email ? data.email : "email@example.com";
    } catch (error) {
         fullName.value = "Erreur";
         email.value = "indisponible";
          if (error.response && error.response.status === 401) {
             logout();
          }
    }
};

const toggleNotificationDropdown = () => {
  isNotificationDropdownOpen.value = !isNotificationDropdownOpen.value;
  isProfileDropdownOpen.value = false;
};

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
  isNotificationDropdownOpen.value = false;
};

const closeProfileDropdown = () => { isProfileDropdownOpen.value = false; };
const closeNotificationDropdown = () => { isNotificationDropdownOpen.value = false; };

const handleClickOutside = (event) => {
  const notificationElement = notificationContainer.value || mobileNotificationContainer.value;
  if (notificationElement && !notificationElement.contains(event.target)) {
    closeNotificationDropdown();
  }
  if (profileDropdownContainer.value && !profileDropdownContainer.value.contains(event.target)) {
    closeProfileDropdown();
  }
};

const handleNotificationClick = (notification, index) => {
  notifications.value.splice(index, 1);
  closeNotificationDropdown();
};

const logout = () => {
  closeProfileDropdown();
  localStorage.removeItem("authToken");
  fullName.value = "";
  email.value = "";
  router.push("/");
};

onMounted(() => {
  loadUserInfo();
  document.addEventListener("click", handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
});
</script>

<style scoped>
</style>