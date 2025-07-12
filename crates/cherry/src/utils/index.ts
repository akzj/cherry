

const isTauriEnv = typeof window !== 'undefined' && !!(window as any).__TAURI__;

export { isTauriEnv };