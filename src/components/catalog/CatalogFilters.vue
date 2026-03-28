<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      class="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
      :class="activeCategory === null
        ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'"
      @click="clearFilters"
    >
      All
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
      :class="activeCategory === cat
        ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5'
        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'"
      @click="setCategory(cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog.store'

const store = useCatalogStore()
const { categories, activeCategory } = storeToRefs(store)
const { setCategory, clearFilters } = store
</script>
