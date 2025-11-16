<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
    <div class="max-w-4xl mx-auto w-full bg-white rounded-xl shadow-lg transition-all duration-300">

      <div v-if="!cvDocumentData && !pdfBase64Content" class="p-8">
        <h1 class="text-center text-3xl font-extrabold text-gray-900 mb-4">Upload your CV </h1>
        <p class="text-center text-gray-600 text-lg mb-8">
          Upload your CV to view it and manage your information.
        </p>
        <p v-if="uploadError" class="text-center text-red-600 text-sm mb-4 font-medium">{{ uploadErrorMessage }}</p>

        <div
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          :class="[
            'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200',
            isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
            uploadError ? 'border-red-500' : ''
          ]"
        >
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf"
            @change="handleFileSelect"
            :disabled="isLoading"
            class="hidden"
          />
          <div class="flex flex-col items-center justify-center space-y-4">
            <svg class="w-16 h-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-lg font-semibold text-gray-700">
              <span class="text-blue-600 hover:text-blue-700">Click to choose</span> or drag and drop
            </p>
            <p class="text-sm text-gray-500">A single PDF file (Max 5MB)</p>
          </div>
        </div>

        <div v-if="isLoading" class="mt-8 text-center">
          <div class="flex items-center justify-center text-base text-gray-600 font-medium">
            <svg class="animate-spin mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            Loading CV...
          </div>
        </div>

        <div class="mt-8 text-center" v-if="!isLoading">
            <button
              @click="fetchExistingCv"
              :disabled="isLoading"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              View my existing CV
            </button>
        </div>

      </div>

      <div v-else class="transition-opacity duration-500 w-full h-full p-6">
        <CvViewer
          :pdfBase64="pdfBase64Content"
          :cvDocumentData="cvDocumentData"
          @error-occurred="handleViewerError"
          @document-loaded="handleViewerLoaded"
          @continue="uploadPdfToServer"
          @cancel="cancelProcess"
        />
      </div>

    </div>
  </div>
</template>
<script>import CvViewer from './CvViewer.vue';
import axios from '../util/axios'; // Make sure this path is correct

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default {
  name: "ChargerPdf", // LoadPdf
  components: { CvViewer },
  data() {
    return {
      selectedFile: null,
      pdfBase64Content: '', // For new uploads
      cvDocumentData: null, // For existing CV from API
      isLoading: false,
      isDraggingOver: false,
      uploadError: false,
      uploadErrorMessage: "",
      hasFetchedInitialCv: false, // New flag to track initial fetch
    };
  },
  mounted() {
    // Automatically try to fetch an existing CV when the component is mounted
    if (!this.hasFetchedInitialCv) {
      this.fetchExistingCv();
      this.hasFetchedInitialCv = true; // Prevent refetch on subsequent renders
    }
  },
  methods: {
    // --- File Input and Drag/Drop Handlers ---
    triggerFileInput() {
      if (!this.isLoading) this.$refs.fileInput.click();
    },
    handleDragOver(event) {
      this.isDraggingOver = true;
    },
    handleDragLeave(event) {
      this.isDraggingOver = false;
    },
    handleFileSelect(event) {
      this.clearError();
      if (event.target.files?.length) this.addFile(event.target.files[0]);
      this.resetFileInput();
    },
    handleDrop(event) {
      this.clearError();
      this.isDraggingOver = false;
      if (event.dataTransfer.files?.length) this.addFile(event.dataTransfer.files[0]);
      this.resetFileInput();
    },

    // --- File Validation and Processing ---
    addFile(file) {
      if (file.type !== "application/pdf") {
        this.uploadErrorMessage = "Only PDF files are accepted.";
        this.uploadError = true;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.uploadErrorMessage = `File size exceeds 5 MB.`;
        this.uploadError = true;
        return;
      }

      this.selectedFile = file;
      this.pdfBase64Content = ''; // Clear previous content if any
      this.cvDocumentData = null; // Clear existing CV data
      this.loadAndDisplayPdf();
    },

    async loadAndDisplayPdf() {
      if (!this.selectedFile) return;
      this.isLoading = true;
      try {
        const reader = new FileReader();
        reader.onload = e => {
          this.pdfBase64Content = e.target.result.split(",")[1];
          this.isLoading = false;
        };
        reader.readAsDataURL(this.selectedFile);
      } catch (error) {
        this.uploadErrorMessage = "Error while loading the file.";
        this.uploadError = true;
        this.isLoading = false;
      }
    },

    // --- CV Viewer Events ---
    handleViewerError({ context, message }) {
      this.uploadErrorMessage = `PDF Viewer Error (${context}): ${message}`;
      this.uploadError = true;
    },
    handleViewerLoaded({ success, pageCount }) {
      if (success) console.log(`PDF loaded (${pageCount} pages).`);
    },
    cancelProcess() {
      this.pdfBase64Content = '';
      this.selectedFile = null;
      this.cvDocumentData = null; // Clear fetched data
      this.clearError();
      // After canceling, try to re-fetch existing CV in case user clicked "Cancel" on a newly uploaded CV
      // or to ensure the display returns to the correct state.
      this.fetchExistingCv();
    },

    // --- Utility Methods ---
    clearError() {
      this.uploadError = false;
      this.uploadErrorMessage = "";
    },
    resetFileInput() {
      if (this.$refs.fileInput) this.$refs.fileInput.value = null;
    },

    // --- API Interactions ---

    // ✅ MAIN FUNCTION: Upload PDF to the backend when user clicks "Continue"
    async uploadPdfToServer() {
      if (!this.pdfBase64Content || !this.selectedFile) {
        alert("No file to send.");
        return;
      }

      const payload = [
        {
          fileName: this.selectedFile.name,
          fileBase64: this.pdfBase64Content
        }
      ];

      try {
        this.isLoading = true;
        // axios instance already handles Authorization header via interceptor
        const response = await axios.post(
          "https://localhost:7059/protected-resource/Transaction/pdfs",
          payload,
        );
        console.log("✅ File successfully sent:", response.data);

        // After successful upload, reload the CV data from the server
        // This ensures the displayed CV is the officially saved one,
        // and updates any metadata displayed in CvViewer
        this.fetchExistingCv();
        this.clearError(); // Clear any previous upload errors
      } catch (error) {
        console.error("❌ Error during send:", error);
        this.uploadErrorMessage = `CV upload failed: ${error.response?.data?.message || error.message}`;
        this.uploadError = true;
      } finally {
        this.isLoading = false;
      }
    },

    // New Function: Fetch existing CV from the backend
    async fetchExistingCv() {
      this.clearError();
      this.pdfBase64Content = ''; // Clear any currently uploaded file or previous content
      this.selectedFile = null; // Clear selected file

      try {
        this.isLoading = true;
        // axios instance already handles Authorization header via interceptor
        const response = await axios.get("https://localhost:7059/protected-resource/Transaction/GetCV");

        if (response.data && response.data.document && response.data.document.base64Data) {
          this.cvDocumentData = response.data; // Store the full response
          this.pdfBase64Content = response.data.document.base64Data; // Set the base64 for viewer
        } else {
          // If no CV found, ensure both are null to trigger upload component
          this.cvDocumentData = null;
          this.pdfBase64Content = '';
          this.uploadErrorMessage = "No existing CV found.";
          // Do NOT set uploadError = true here, as it's not an error but a state
          // this.uploadError = true;
        }
      } catch (error) {
        console.error("❌ Error while fetching existing CV:", error);
        // Treat 404 as "no CV found" rather than a hard error for display purposes
        if (error.response && error.response.status === 404) {
          this.cvDocumentData = null;
          this.pdfBase64Content = '';
          this.uploadErrorMessage = "No existing CV found.";
        } else {
          this.uploadErrorMessage = `Failed to fetch CV: ${error.response?.data?.message || error.message}`;
          this.uploadError = true;
        }
      } finally {
        this.isLoading = false;
      }
    }
  },
};</script>