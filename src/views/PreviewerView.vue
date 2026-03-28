<template>
  <div class="h-screen flex flex-col bg-[var(--color-bg)] overflow-hidden">

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <AppSpinner />
        <span class="text-xs text-[var(--color-text-secondary)] tracking-widest uppercase">Loading</span>
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-sm text-[var(--color-text-secondary)]">{{ error }}</p>
    </div>

    <template v-else-if="product && contract">

      <!-- 3D canvas -->
      <div class="relative flex-shrink-0" style="height: 55vh">
        <ModelCanvas ref="canvasComponent" :loading="false" :is-placeholder="!product?.modelUrl" @reset-camera="resetCamera" />
        <div class="absolute top-0 inset-x-0 px-5 py-4 flex items-center justify-between">
          <button
            class="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            @click="goBack"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Catalog
          </button>
          <span class="text-xs text-[var(--color-text-secondary)]/50 tracking-widest uppercase">3D Viewer</span>
        </div>
      </div>

      <!-- Two-column panel -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 border-t border-[var(--color-border)]">

        <!-- Left: Product info -->
        <div class="overflow-y-auto border-b md:border-b-0 md:border-r border-[var(--color-border)]">
          <div class="px-7 py-7 space-y-6">
            <ProductInfo :product="product" />
            <div class="h-4" />
          </div>
        </div>

        <!-- Right: Configuration -->
        <div class="overflow-y-auto">
          <div class="px-7 py-7 space-y-6">

            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-5">
                Configuration
              </p>

              <div class="space-y-6">
                <MaterialSwatches
                  v-if="materialSheet"
                  :materials="materialSheet"
                  :active="activeMaterial"
                  @select="handleMaterialSelect"
                />

                <template v-if="hasInteractiveParts">
                  <AppDivider />
                  <template v-for="(part, key) in contract.parts" :key="key">
                    <template v-if="part.actions?.length || part.capabilities?.rotate">
                      <PartPanel
                        :part-key="String(key)"
                        :part="part"
                        :state="partStates[String(key)] ?? { rotation: 0 }"
                        @action="handleAction"
                        @rotate="handleRotate"
                      />
                      <AppDivider v-if="!isLastInteractivePart(String(key))" />
                    </template>
                  </template>
                </template>
              </div>
            </div>

            <div class="h-4" />
          </div>
        </div>

      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/stores/product.store'
import { useContractInteraction } from '@/composables/useContractInteraction'
import { useThreeScene } from '@/composables/useThreeScene'
import ModelCanvas from '@/components/previewer/ModelCanvas.vue'
import ProductInfo from '@/components/previewer/ProductInfo.vue'
import MaterialSwatches from '@/components/previewer/MaterialSwatches.vue'
import PartPanel from '@/components/previewer/PartPanel.vue'
import AppDivider from '@/components/ui/AppDivider.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { assetUrl } from '@/utils/assetUrl'

const route = useRoute()
const store = useProductStore()
const { product, contract, materialSheet, loading, error } = storeToRefs(store)

const canvasComponent = ref<InstanceType<typeof ModelCanvas> | null>(null)
const { init, loadModel, buildPlaceholderModel, playAnimation, applyRotation, applyMaterial, applyLighting } = useThreeScene()
const { partStates, activeMaterial, onPartChange, setPartRotation, triggerAction, setMaterial } =
  useContractInteraction(contract)

onPartChange((type, payload) => {
  if (type === 'rotation') {
    const p = payload as { nodeName: string; axis: 'x' | 'y' | 'z'; value: number }
    applyRotation(p.nodeName, p.axis, p.value)
  } else if (type === 'material') {
    const p = payload as { materialId: string }
    const mat = materialSheet.value?.[p.materialId]
    if (mat) applyMaterial(mat)
  } else if (type === 'animation') {
    const p = payload as { animationName: string }
    playAnimation(p.animationName)
  }
})

const hasInteractiveParts = computed(() => {
  if (!contract.value) return false
  return Object.values(contract.value.parts).some((p) => p.actions?.length || p.capabilities?.rotate)
})

const interactiveParts = computed(() => {
  if (!contract.value) return []
  return Object.keys(contract.value.parts).filter(
    (k) => contract.value!.parts[k].actions?.length || contract.value!.parts[k].capabilities?.rotate,
  )
})

function isLastInteractivePart(key: string) {
  return interactiveParts.value.at(-1) === key
}

function handleAction(partKey: string, actionId: string) {
  triggerAction(partKey, actionId)
}

function handleRotate(partKey: string, value: number) {
  setPartRotation(partKey, value)
}

function handleMaterialSelect(materialId: string) {
  setMaterial(materialId)
  const mat = materialSheet.value?.[materialId]
  if (mat) applyMaterial(mat)
}

function resetCamera() {
  // future: reset OrbitControls to default position
}

function goBack() {
  if (window.history.length > 1) window.history.back()
  else window.close()
}

let sceneInitialized = false

watch(
  [loading, canvasComponent],
  async ([isLoading, comp]) => {
    if (!isLoading && comp?.canvasRef && !sceneInitialized) {
      await nextTick()
      const canvas = comp.canvasRef
      if (!canvas) return
      sceneInitialized = true
      init(canvas)

      if (!contract.value) return

      applyLighting(contract.value.lighting)

      if (product.value?.modelUrl) {
        await loadModel(assetUrl(product.value.modelUrl))
      } else {
        buildPlaceholderModel(contract.value)
      }

      if (materialSheet.value && activeMaterial.value) {
        const mat = materialSheet.value[activeMaterial.value]
        if (mat) applyMaterial(mat)
      }
    }
  },
)

onMounted(() => {
  store.fetchProduct(route.params.id as string)
})
</script>
