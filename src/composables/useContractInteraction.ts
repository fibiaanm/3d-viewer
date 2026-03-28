import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { Contract } from '@/types/contract'
import { useTween } from './useTween'

type ChangeType = 'rotation' | 'material' | 'animation'

interface RotationPayload {
  nodeName: string
  axis: 'x' | 'y' | 'z'
  value: number
}

interface MaterialPayload {
  materialId: string
}

interface AnimationPayload {
  animationName: string
  durationMs: number
}

type ChangeCallback = (type: ChangeType, payload: RotationPayload | MaterialPayload | AnimationPayload) => void

export interface PartState {
  rotation: number
}

export function useContractInteraction(contractRef: Ref<Contract | null>) {
  const { tween, cancel } = useTween()

  const partStates = ref<Record<string, PartState>>({})
  const activeMaterial = ref<string | null>(null)
  const callbacks: ChangeCallback[] = []

  watch(
    contractRef,
    (contract) => {
      if (!contract) return
      activeMaterial.value = contract.material?.default ?? null
      const states: Record<string, PartState> = {}
      for (const [key, part] of Object.entries(contract.parts)) {
        states[key] = { rotation: part.transform?.rotation?.default ?? 0 }
      }
      partStates.value = states
    },
    { immediate: true },
  )

  function onPartChange(cb: ChangeCallback) {
    callbacks.push(cb)
  }

  function notify(type: ChangeType, payload: RotationPayload | MaterialPayload | AnimationPayload) {
    callbacks.forEach((cb) => cb(type, payload))
  }

  function setPartRotation(partKey: string, value: number) {
    const contract = contractRef.value
    if (!contract || !partStates.value[partKey]) return
    partStates.value[partKey].rotation = value
    const part = contract.parts[partKey]
    const axis = part.transform?.rotation?.axis ?? 'y'
    notify('rotation', { nodeName: part.nodeName, axis, value })
  }

  function triggerAction(partKey: string, actionId: string) {
    const contract = contractRef.value
    if (!contract) return
    const part = contract.parts[partKey]
    if (!part?.actions) return
    const action = part.actions.find((a) => a.id === actionId)
    if (!action) return

    if (action.type === 'animation' && action.animationName) {
      notify('animation', { animationName: action.animationName, durationMs: action.durationMs })
      return
    }

    // transform action — manual tween
    cancel()
    if (!part.transform?.rotation) return
    const axis = part.transform.rotation.axis
    const target = action.transform?.rotation?.[axis] ?? 0
    const from = partStates.value[partKey]?.rotation ?? 0

    tween(from, target, action.durationMs, (val) => {
      if (partStates.value[partKey]) partStates.value[partKey].rotation = val
      notify('rotation', { nodeName: part.nodeName, axis, value: val })
    })
  }

  function setMaterial(materialId: string) {
    activeMaterial.value = materialId
    notify('material', { materialId })
  }

  return { partStates, activeMaterial, onPartChange, setPartRotation, triggerAction, setMaterial }
}
