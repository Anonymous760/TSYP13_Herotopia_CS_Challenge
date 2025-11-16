<template>
  <div class="flex flex-col lg:flex-row h-[calc(100vh-6rem)] max-h-[1000px] bg-white rounded-xl shadow-2xl overflow-hidden">

    <div class="relative flex-grow flex items-center justify-center p-6 border-r border-gray-200 lg:w-2/3">
      <div class="absolute top-4 w-full flex justify-between px-6 z-30">
        <button
          @click="cancelAction"
          class="flex items-center justify-center w-9 h-9 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
          aria-label="Cancel and close"
          title="Cancel"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div class="flex items-center justify-center bg-white px-4 py-2 rounded-full shadow-md">
          <h2 v-if="pdfDocument" class="text-base font-semibold text-gray-800 whitespace-nowrap">
            Page {{ currentPageNumber }} / {{ totalPageCount }}
          </h2>
          <div v-else-if="isLoadingDocument">
            <span class="text-sm text-blue-600 animate-pulse">Loading document...</span>
          </div>
          <div v-else>
            <span class="text-sm text-red-600">No CV to display.</span>
          </div>
        </div>

        <button
          @click="continueAction"
          class="flex items-center justify-center w-9 h-9 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          aria-label="Continue"
          title="Continue and save"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>

      <div ref="canvasContainer" class="pdf-canvas-wrapper relative flex-grow flex items-center justify-center bg-gray-50 rounded-lg shadow-inner mt-16 mb-16">
        <div v-if="isRenderingPage || isLoadingDocument" class="absolute inset-0 flex items-center justify-center z-20 bg-white bg-opacity-70 rounded-lg ">
          <div class="flex flex-col items-center text-blue-700 animate-pulse">
            <svg class="animate-spin h-8 w-8 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-lg font-medium mt-3">{{ isLoadingDocument ? 'Loading document...' : `Rendering page ${renderingPageInfo}...` }}</span>
          </div>
        </div>

        <canvas ref="pdfCanvasElement" class="block object-contain max-h-full max-w-full rounded-lg"></canvas>

        <div v-if="!pdfDocument && !isLoadingDocument" class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
          <p class="text-lg font-medium">Please upload a CV to view it.</p>
        </div>
      </div>

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center bg-white p-3 rounded-full shadow-lg z-30">
        <button
          @click="previousPage"
          :disabled="!canNavigatePreviousPage"
          class="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          aria-label="Previous page"
          title="Previous page"
        >
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7"/>
          </svg>
        </button>
        <span class="mx-4 text-base font-semibold text-gray-800">{{ currentPageNumber }} / {{ totalPageCount }}</span>
        <button
          @click="nextPage"
          :disabled="!canNavigateNextPage"
          class="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full shadow-sm hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          aria-label="Next page"
          title="Next page"
        >
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="lg:w-1/3 p-8 bg-gray-50 flex flex-col justify-between">
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">CV Information</h3>

        <div v-if="user" class="space-y-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Full Name</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.firstName }} {{ user.lastName }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Email</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Phone</p>
            <p class="text-lg font-semibold text-gray-800">{{ user.phone }}</p>
          </div>
          <div v-if="cvDocumentData && cvDocumentData.document">
            <p class="text-sm font-medium text-gray-500">File Name</p>
            <p class="text-lg font-semibold text-gray-800 break-words">{{ cvDocumentData.document.name }}</p>
          </div>
          <div v-if="cvDocumentData && cvDocumentData.document && cvDocumentData.document.taille > 0">
            <p class="text-sm font-medium text-gray-500">File Size</p>
            <p class="text-lg font-semibold text-gray-800">{{ (cvDocumentData.document.taille / 1024).toFixed(2) }} KB</p>
          </div>
        </div>
        <div v-else class="text-gray-600 italic">
          <p>No user information available for this CV.</p>
        </div>
      </div>

      <div class="mt-auto pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
        Last Updated: <span class="font-medium text-gray-700">Not Available</span>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw, defineComponent } from "vue";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Make sure the worker source path is correct for your build setup
// If you are using Vite/Webpack, this setup is generally correct.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDF_RENDER_SCALE_FACTOR = 1.5; // Increased scale for better default quality and sharpness

export default defineComponent({
  name: 'CvViewer',
  props: {
    pdfBase64: { // Base64 string of the PDF content
      type: String,
      default: '',
    },
    cvDocumentData: { // Full API response object (contains user info, file size, etc.)
      type: Object,
      default: null,
    }
  },
  emits: ['error-occurred', 'document-loaded', 'cancel', 'continue'],
  data() {
    return {
      pdfDocument: null, // The PDF.js document object
      totalPageCount: 0,
      currentPageNumber: 1,
      isLoadingDocument: false,
      isRenderingPage: false,
      renderingPageInfo: '',
      pdfCanvasContext: null,
      currentRenderScale: PDF_RENDER_SCALE_FACTOR,
      resizeObserver: null,
    };
  },
  computed: {
    canNavigatePreviousPage() {
      return this.pdfDocument && this.currentPageNumber > 1 && !this.isRenderingPage && !this.isLoadingDocument;
    },
    canNavigateNextPage() {
      return this.pdfDocument && this.currentPageNumber < this.totalPageCount && !this.isRenderingPage && !this.isLoadingDocument;
    },
    user() {
      return this.cvDocumentData?.user || null;
    }
  },
  watch: {
    pdfBase64: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadPdfFromBase64(newVal);
        } else if (!newVal && this.pdfDocument) {
          this.cleanUpPdfResources();
        }
      },
    },
    // Watch cvDocumentData if you need to react to changes in user info specifically
    cvDocumentData: {
      handler(newVal) {
        // You can add specific logic here if user info updates should trigger something
        // For now, it's reactive via computed `user` prop.
      },
      deep: true,
    }
  },
  mounted() {
    const canvasElement = this.$refs.pdfCanvasElement;
    if (canvasElement instanceof HTMLCanvasElement) {
      this.pdfCanvasContext = canvasElement.getContext('2d');
      this.setupResizeObserver();
    } else {
      this.handleError("Canvas element reference is not valid.", "Initialization");
    }
  },
  beforeUnmount() {
    this.cleanUpPdfResources();
    this.disconnectResizeObserver();
  },
  methods: {
    handleError(message, context = "General") {
      this.$emit('error-occurred', { context, message });
      console.error(`[${context}] ${message}`);
      this.isLoadingDocument = false;
      this.isRenderingPage = false;
    },
    cleanUpPdfResources() {
      this.destroyPdfInstance();
      this.clearCanvasArea();
      this.pdfDocument = null;
      this.currentPageNumber = 1;
      this.totalPageCount = 0;
      this.isLoadingDocument = false;
      this.isRenderingPage = false;
      this.renderingPageInfo = '';
    },
    clearCanvasArea() {
      const canvas = this.$refs.pdfCanvasElement;
      if (this.pdfCanvasContext && canvas instanceof HTMLCanvasElement) {
        this.pdfCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 1; canvas.height = 1; // Reset to minimal size
        canvas.style.width = 'auto'; canvas.style.height = 'auto'; // Reset styles
      }
    },
    destroyPdfInstance() {
      if (this.pdfDocument && typeof this.pdfDocument.destroy === 'function') {
        try { this.pdfDocument.destroy(); } catch (e) { /* Ignore */ }
      }
      this.pdfDocument = null;
    },

    async loadPdfFromBase64(base64String) {
      if (this.isLoadingDocument || !base64String) return;

      this.isLoadingDocument = true;
      this.cleanUpPdfResources(); // Clean up any previous document

      try {
        // Convert Base64 string to Uint8Array for PDF.js
        const pdfDataUint8 = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
        const loadingTask = pdfjsLib.getDocument({ data: pdfDataUint8 });
        const loadedPdf = await loadingTask.promise;

        if (!loadedPdf?.numPages || typeof loadedPdf.getPage !== 'function') {
          throw new Error("Invalid PDF object structure after loading.");
        }
        this.pdfDocument = markRaw(loadedPdf); // Use markRaw to prevent Vue from making the large PDF object reactive
        this.totalPageCount = loadedPdf.numPages;
        this.currentPageNumber = 1;
        await this.renderPdfPage(1);
        this.$emit('document-loaded', { success: true, pageCount: this.totalPageCount });
      } catch (error) {
        this.destroyPdfInstance();
        this.clearCanvasArea();
        this.handleError(`Failed to load PDF: ${error.message}`, "Document Loading");
        this.$emit('document-loaded', { success: false, error: error.message });
      } finally {
        this.isLoadingDocument = false;
      }
    },

    async renderPdfPage(pageNumber) {
      if (this.isRenderingPage || !this.pdfDocument?.getPage || !this.pdfCanvasContext) return;
      if (pageNumber < 1 || pageNumber > this.totalPageCount) return;

      this.isRenderingPage = true;
      this.renderingPageInfo = `${pageNumber}/${this.totalPageCount}`;
      const canvas = this.$refs.pdfCanvasElement;
      const canvasContainer = this.$refs.canvasContainer;

      if (!(canvas instanceof HTMLCanvasElement) || !canvasContainer) {
        this.handleError("Canvas element or its container is not available for rendering.", "Page Rendering");
        this.isRenderingPage = false;
        return;
      }

      try {
        const page = await this.pdfDocument.getPage(pageNumber);

        // Get the actual width and height of the container to determine the viewport
        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;

        // Get original PDF page dimensions at scale 1
        const originalViewport = page.getViewport({ scale: 1 });

        // Calculate a scale factor to make the PDF page fit the container while respecting its aspect ratio.
        // Also, apply a base render scale for quality.
        const targetScaleX = (containerWidth / originalViewport.width) * PDF_RENDER_SCALE_FACTOR;
        const targetScaleY = (containerHeight / originalViewport.height) * PDF_RENDER_SCALE_FACTOR;

        // Choose the smaller scale to ensure the entire page is visible within the container,
        // but don't let it shrink too much if the container is very small.
        // We ensure a minimum scale to maintain readability.
        const finalScale = Math.min(targetScaleX, targetScaleY, PDF_RENDER_SCALE_FACTOR * 2); // Cap max scale

        const viewport = page.getViewport({ scale: finalScale });

        // Set canvas dimensions to match the viewport dimensions (rendered resolution)
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Set CSS styles to make the canvas element fit its parent container,
        // and 'object-contain' will scale the rendered PDF content correctly.
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        const renderContext = { canvasContext: this.pdfCanvasContext, viewport: viewport };
        await page.render(renderContext).promise;
        this.currentPageNumber = pageNumber;
      } catch (error) {
        this.handleError(`Error rendering page ${pageNumber}: ${error.message}`, "Page Rendering");
      } finally {
        this.isRenderingPage = false;
        this.renderingPageInfo = '';
      }
    },

    previousPage() {
      if (this.canNavigatePreviousPage) {
        this.renderPdfPage(this.currentPageNumber - 1);
      }
    },
    nextPage() {
      if (this.canNavigateNextPage) {
        this.renderPdfPage(this.currentPageNumber + 1);
      }
    },
    cancelAction() {
      this.$emit('cancel');
    },
    continueAction() {
      this.$emit('continue');
    },

    // Resize Observer Methods
    setupResizeObserver() {
      const canvasContainer = this.$refs.canvasContainer;
      if (canvasContainer) {
        this.resizeObserver = new ResizeObserver(entries => {
          if (this.pdfDocument && this.currentPageNumber) {
            // Re-render the current page when the container size changes
            // This is key for responsive PDF viewing.
            this.renderPdfPage(this.currentPageNumber);
          }
        });
        this.resizeObserver.observe(canvasContainer);
      }
    },
    disconnectResizeObserver() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    }
  },
});
</script>

<style scoped>
.pdf-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%; /* Take full height of its flex parent */
  display: flex; /* Ensure content is centered */
  align-items: center;
  justify-content: center;
  background-color: #f8fafc; /* Light gray background */
}

.pdf-canvas-wrapper canvas {
  /* object-contain is crucial here: it scales the content to fit the canvas,
  which itself is sized to fit the container. */
  object-fit: contain;
  background-color: #fff;
  border: 1px solid #e2e8f0;
}
</style>