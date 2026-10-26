let demoSpeed: 'normal' | 'fast' = 'normal'

export function setGlobalDemoSpeed(speed: 'normal' | 'fast') {
  demoSpeed = speed
}

export function getGlobalDemoSpeed(): 'normal' | 'fast' {
  return demoSpeed
}

export async function simulate(ms: number): Promise<void> {
  const effectiveMs = demoSpeed === 'fast' ? Math.max(100, Math.round(ms * 0.2)) : ms
  return new Promise((resolve) => setTimeout(resolve, effectiveMs))
}
