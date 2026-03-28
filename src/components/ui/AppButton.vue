<template>
  <button
    v-bind="$attrs"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 cursor-pointer select-none',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      variantClasses,
      sizeClasses,
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}>()

const variantMap: Record<string, string> = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]',
  outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
}
const sizeMap: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 rounded',
  md: 'text-sm px-4 py-2 rounded-md',
  lg: 'text-sm px-6 py-3 rounded-lg',
}

const variantClasses = variantMap[props.variant ?? 'primary']
const sizeClasses = sizeMap[props.size ?? 'md']
</script>
