<template>
  <article
    class="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[var(--color-accent)]/40 hover:-translate-y-0.5"
    @click="openProduct"
  >
    <div class="aspect-[4/3] bg-[var(--color-surface-2)] relative overflow-hidden">
      <img
        v-if="item.previewImage && !imgError"
        :src="previewSrc ?? undefined"
        :alt="item.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="imgError = true"
      />
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center"
      >
        <svg class="w-10 h-10 text-[var(--color-border)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11v10" />
        </svg>
      </div>
      <div class="absolute top-3 left-3">
        <AppBadge>{{ item.category }}</AppBadge>
      </div>
    </div>

    <div class="p-5">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1 tracking-wide">{{ item.title }}</h3>
      <p class="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 mb-4">{{ item.description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-base font-semibold text-[var(--color-accent)]">{{ formattedPrice }}</span>
        <AppButton size="sm" variant="outline">View in 3D</AppButton>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { CatalogItem } from '@/types/catalog'
import { assetUrl } from '@/utils/assetUrl'

const props = defineProps<{ item: CatalogItem }>()
const router = useRouter()
const imgError = ref(false)

const previewSrc = computed(() => props.item.previewImage ? assetUrl(props.item.previewImage) : null)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.item.currency ?? 'USD',
    minimumFractionDigits: 0,
  }).format(props.item.price),
)

function openProduct() {
  const { href } = router.resolve({ name: 'product', params: { id: props.item.id } })
  window.open(href, '_blank')
}
</script>
