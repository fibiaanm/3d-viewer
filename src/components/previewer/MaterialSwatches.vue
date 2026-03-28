<template>
  <div>
    <h4 class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
      Finish
    </h4>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="mat in materialsArray"
        :key="mat.id"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer group"
        :class="active === mat.id
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
          : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]/50'"
        @click="emit('select', mat.id)"
      >
        <span
          class="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-white/10"
          :style="{ backgroundColor: mat.color }"
        />
        <span
          class="text-xs transition-colors duration-200"
          :class="active === mat.id
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'"
        >
          {{ mat.label }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MaterialSheet } from '@/types/contract'

const props = defineProps<{
  materials: MaterialSheet
  active: string | null
}>()

const emit = defineEmits<{ select: [id: string] }>()

const materialsArray = computed(() => Object.values(props.materials))
</script>
