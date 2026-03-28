<template>
  <div class="w-full">
    <div v-if="label || showValue" class="flex items-center justify-between mb-2">
      <span v-if="label" class="text-xs text-[var(--color-text-secondary)] tracking-wide">{{ label }}</span>
      <span v-if="showValue" class="text-xs font-mono text-[var(--color-accent)]">{{ displayValue }}</span>
    </div>
    <div class="relative h-5 flex items-center">
      <div class="absolute inset-x-0 h-px bg-[var(--color-border)]" />
      <div
        class="absolute h-px bg-[var(--color-accent)] origin-left"
        :style="{ width: `${percent}%` }"
      />
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        class="absolute inset-0 w-full opacity-0 cursor-pointer"
        @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      />
      <div
        class="absolute w-3 h-3 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-bg)] pointer-events-none"
        :style="{ left: `calc(${percent}% - 6px)` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  min: number
  max: number
  step?: number
  label?: string
  showValue?: boolean
  unit?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const percent = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)
const displayValue = computed(() => `${Math.round(props.modelValue)}${props.unit ?? ''}`)
</script>
