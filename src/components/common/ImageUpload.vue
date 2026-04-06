<template>
  <div class="image-upload-wrapper">
    <label v-if="label" class="upload-label">{{ label }}</label>
    
    <div 
      class="upload-container"
      :class="{ 'is-dragging': isDragging, 'has-error': error }"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden-input"
        accept="image/*"
        @change="onFileChange"
      />

      <!-- Preview State -->
      <div v-if="previewUrl" class="preview-mode">
        <img :src="previewUrl" alt="Preview" class="preview-image" @load="isUploading = false" />
        <div class="preview-overlay">
          <i class="pi pi-camera"></i>
          <span>Alterar Foto</span>
        </div>
        <button v-if="!disabled" type="button" class="remove-btn" @click.stop="removeImage">
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-mode">
        <div v-if="isUploading" class="upload-loader">
          <div class="spinner"></div>
          <span>Processando...</span>
        </div>
        <template v-else>
          <div class="upload-icon">
            <i class="pi pi-cloud-upload"></i>
          </div>
          <div class="upload-text">
            <span class="main-text">Clique ou arraste uma foto</span>
             <span class="sub-text">PNG, JPG ou WEBP (Máx. 10MB)</span>
          </div>
        </template>
      </div>
    </div>
    
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  initialPreview: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const fileInput = ref(null)
const isDragging = ref(false)
const isUploading = ref(false)
const previewUrl = ref(props.initialPreview)
const error = ref('')

watch(() => props.initialPreview, (newVal) => {
  if (newVal) previewUrl.value = newVal
})

const onDragOver = () => {
  if (props.disabled) return
  isDragging.value = true
}

const onDragLeave = () => {
  isDragging.value = false
}

const onDrop = (e) => {
  if (props.disabled) return
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  handleFile(file)
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  handleFile(file)
}

const handleFile = (file) => {
  if (!file) return
  
  error.value = ''
  
  // Validation
  if (!file.type.startsWith('image/')) {
    error.value = 'Por favor, selecione um arquivo de imagem válido.'
    return
  }
  
   if (file.size > 10 * 1024 * 1024) {
     error.value = 'A imagem deve ter no máximo 10MB.'
     return
   }

  isUploading.value = true
  
  // Update model
  emit('update:modelValue', file)
  emit('change', file)

  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  previewUrl.value = null
  emit('update:modelValue', null)
  emit('change', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.upload-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.upload-container {
  position: relative;
  width: 150px;
  height: 150px;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  background: #f9fafb;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-container:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.upload-container.is-dragging {
  border-color: #6366f1;
  background: #eef2ff;
  transform: scale(1.02);
}

.upload-container.has-error {
  border-color: #ef4444;
}

.hidden-input {
  display: none;
}

/* Preview State */
.preview-mode {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: fadeIn 0.4s ease-out;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
  gap: 0.5rem;
}

.preview-mode:hover .preview-overlay {
  opacity: 1;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
  background: #dc2626;
}

/* Empty State */
.empty-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  gap: 0.75rem;
}

.upload-icon {
  font-size: 1.5rem;
  color: #6366f1;
  background: #eef2ff;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.upload-text {
  display: flex;
  flex-direction: column;
}

.main-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
}

.sub-text {
  font-size: 0.625rem;
  color: #6b7280;
}

/* Loader */
.upload-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #eef2ff;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

.error-message {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
