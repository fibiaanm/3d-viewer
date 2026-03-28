<template>
  <div class="min-h-screen bg-[var(--color-bg)]">
    <header class="border-b border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-md bg-[var(--color-bg)]/80">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">3D Catalog</h1>
          <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">Interactive product viewer</p>
        </div>
        <span class="text-xs text-[var(--color-text-secondary)]">
          {{ filtered.length }} item{{ filtered.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="mb-8">
        <CatalogFilters />
      </div>

      <div v-if="loading" class="flex justify-center py-24">
        <AppSpinner />
      </div>

      <div v-else-if="error" class="py-24 text-center space-y-4">
        <p class="text-sm text-[var(--color-text-secondary)]">Failed to load catalog.</p>
        <AppButton variant="outline" size="sm" @click="fetchCatalog">Retry</AppButton>
      </div>

      <div v-else-if="filtered.length === 0" class="py-24 text-center space-y-4">
        <p class="text-sm text-[var(--color-text-secondary)]">No items match the current filter.</p>
        <AppButton variant="ghost" size="sm" @click="clearFilters">Clear filters</AppButton>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      >
        <ProductCard v-for="item in filtered" :key="item.id" :item="item" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCatalogStore } from '@/stores/catalog.store'
import ProductCard from '@/components/catalog/ProductCard.vue'
import CatalogFilters from '@/components/catalog/CatalogFilters.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppButton from '@/components/ui/AppButton.vue'

const store = useCatalogStore()
const { filtered, loading, error } = storeToRefs(store)
const { fetchCatalog, clearFilters } = store

onMounted(fetchCatalog)
</script>
