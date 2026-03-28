import { ref, onUnmounted } from 'vue'

export function useTween() {
  const rafId = ref<number | null>(null)

  function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  function tween(
    from: number,
    to: number,
    durationMs: number,
    onUpdate: (val: number) => void,
    onComplete?: () => void,
  ) {
    cancel()
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      onUpdate(from + (to - from) * easeInOut(progress))
      if (progress < 1) {
        rafId.value = requestAnimationFrame(tick)
      } else {
        rafId.value = null
        onComplete?.()
      }
    }

    rafId.value = requestAnimationFrame(tick)
  }

  function cancel() {
    if (rafId.value !== null) {
      cancelAnimationFrame(rafId.value)
      rafId.value = null
    }
  }

  onUnmounted(cancel)

  return { tween, cancel }
}
