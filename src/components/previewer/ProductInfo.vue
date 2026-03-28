<template>
  <div class="space-y-5">
    <div>
      <div class="flex flex-wrap gap-1.5 mb-3">
        <AppBadge>{{ product.category }}</AppBadge>
        <AppBadge v-for="tag in product.tags" :key="tag">{{ tag }}</AppBadge>
      </div>
      <h1 class="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] mb-1">
        {{ product.title }}
      </h1>
      <p class="text-xl font-semibold text-[var(--color-accent)]">{{ formattedPrice }}</p>
    </div>

    <p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">{{ product.longDescription }}</p>

    <div>
      <h3 class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-3">
        Specifications
      </h3>
      <dl class="space-y-2.5">
        <div v-if="product.dimensions" class="flex justify-between">
          <dt class="text-xs text-[var(--color-text-secondary)]">Dimensions</dt>
          <dd class="text-xs font-mono text-[var(--color-text-primary)]">
            {{ product.dimensions.width }} × {{ product.dimensions.height }} × {{ product.dimensions.depth }} {{ product.dimensions.unit }}
          </dd>
        </div>
        <div v-if="product.weight" class="flex justify-between">
          <dt class="text-xs text-[var(--color-text-secondary)]">Weight</dt>
          <dd class="text-xs font-mono text-[var(--color-text-primary)]">{{ product.weight }}</dd>
        </div>
        <div v-if="product.materials?.length" class="flex justify-between">
          <dt class="text-xs text-[var(--color-text-secondary)]">Materials</dt>
          <dd class="text-xs text-[var(--color-text-primary)]">{{ product.materials.join(', ') }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { Product } from '@/types/product'

const props = defineProps<{ product: Product }>()

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.currency ?? 'USD',
    minimumFractionDigits: 0,
  }).format(props.product.price),
)
</script>
