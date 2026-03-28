<template>
  <div class="py-4">
    <h4 class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] mb-4">
      {{ part.label || partKey }}
    </h4>

    <div v-if="part.actions?.length" class="flex flex-wrap gap-2 mb-5">
      <AppButton
        v-for="action in part.actions"
        :key="action.id"
        size="sm"
        variant="outline"
        @click="emit('action', partKey, action.id)"
      >
        {{ action.label }}
      </AppButton>
    </div>

    <div v-if="part.capabilities?.rotate && part.transform?.rotation">
      <AppSlider
        :model-value="state.rotation"
        :min="part.transform.rotation.min"
        :max="part.transform.rotation.max"
        :step="1"
        label="Rotation"
        :show-value="true"
        unit="°"
        @update:model-value="emit('rotate', partKey, $event)"
      />
    </div>

    <p
      v-if="!part.actions?.length && !part.capabilities?.rotate"
      class="text-xs text-[var(--color-text-secondary)]/50 italic"
    >
      Static part — no configurable properties
    </p>
  </div>
</template>

<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import AppSlider from '@/components/ui/AppSlider.vue'
import type { ContractPart } from '@/types/contract'
import type { PartState } from '@/composables/useContractInteraction'

defineProps<{
  partKey: string
  part: ContractPart
  state: PartState
}>()

const emit = defineEmits<{
  action: [partKey: string, actionId: string]
  rotate: [partKey: string, value: number]
}>()
</script>
