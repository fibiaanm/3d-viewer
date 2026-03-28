<template>
  <span
    :class="[
      'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full tracking-wide',
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ variant?: 'default' | 'accent' }>()

const variantMap: Record<string, string> = {
  default: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]',
  accent: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
}
const variantClasses = variantMap[props.variant ?? 'default']
</script>
