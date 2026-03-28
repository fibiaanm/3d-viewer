import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types/product'
import type { Contract, MaterialSheet } from '@/types/contract'

export const useProductStore = defineStore('product', () => {
  const product = ref<Product | null>(null)
  const contract = ref<Contract | null>(null)
  const materialSheet = ref<MaterialSheet | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProduct(id: string) {
    loading.value = true
    error.value = null
    product.value = null
    contract.value = null
    materialSheet.value = null
    try {
      const productRes = await fetch(`/products/${id}/product.json`)
      if (!productRes.ok) throw new Error(`Product not found: ${id}`)
      product.value = await productRes.json()

      const contractRes = await fetch(product.value!.contractPath)
      contract.value = await contractRes.json()

      const matRes = await fetch(contract.value!.material.sheetUrl)
      materialSheet.value = await matRes.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { product, contract, materialSheet, loading, error, fetchProduct }
})
