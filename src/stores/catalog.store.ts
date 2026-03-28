import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CatalogItem } from '@/types/catalog'
import { assetUrl } from '@/utils/assetUrl'

export const useCatalogStore = defineStore('catalog', () => {
  const items = ref<CatalogItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeCategory = ref<string | null>(null)

  const categories = computed<string[]>(() => [...new Set(items.value.map((i) => i.category))])

  const filtered = computed<CatalogItem[]>(() => {
    if (!activeCategory.value) return items.value
    return items.value.filter((i) => i.category === activeCategory.value)
  })

  async function fetchCatalog() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(assetUrl('/catalog.json'))
      items.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  function setCategory(cat: string) {
    activeCategory.value = activeCategory.value === cat ? null : cat
  }

  function clearFilters() {
    activeCategory.value = null
  }

  return { items, loading, error, categories, filtered, activeCategory, fetchCatalog, setCategory, clearFilters }
})
