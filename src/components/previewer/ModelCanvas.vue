<template>
  <div class="relative w-full h-full bg-[#111111]">
    <canvas ref="canvasRef" class="w-full h-full block" />

    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-[#111111]"
    >
      <div class="flex flex-col items-center gap-3">
        <AppSpinner />
        <span class="text-xs text-[var(--color-text-secondary)] tracking-widest uppercase">Loading</span>
      </div>
    </div>

    <div class="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

    <div class="absolute bottom-4 right-4">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)]/80 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors backdrop-blur-sm cursor-pointer text-sm"
        title="Reset camera"
        @click="emit('reset-camera')"
      >
        ⟲
      </button>
    </div>

    <div
      v-if="isPlaceholder"
      class="absolute bottom-4 left-4 text-xs text-[var(--color-text-secondary)]/30 tracking-wide select-none pointer-events-none"
    >
      Placeholder geometry
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

defineProps<{ loading?: boolean; isPlaceholder?: boolean }>()
const emit = defineEmits<{ 'reset-camera': [] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
defineExpose({ canvasRef })
</script>
