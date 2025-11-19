// TaskCoordinator.js
import * as SecureStore from "expo-secure-store";

const LOCK_KEY = "global_task_lock";

/**
 * Comprueba si hay lock activo.
 */
export async function isTaskLocked() {
  const lock = await SecureStore.getItemAsync(LOCK_KEY);
  return !!lock;
}

/**
 * Espera hasta que el lock se libere.
 */
export async function waitForUnlock() {
  while (await isTaskLocked()) {
    console.log("⏳ Esperando desbloqueo global...");
    await new Promise((r) => setTimeout(r, 2000)); // check cada 2s
  }
}

/**
 * Adquiere el lock para la tarea actual.
 */
export async function acquireTaskLock(taskName) {
  await SecureStore.setItemAsync(
    LOCK_KEY,
    JSON.stringify({ taskName, timestamp: Date.now() })
  );
  console.log(`🔒 Lock adquirido por ${taskName}`);
}

/**
 * Libera el lock global.
 */
export async function releaseTaskLock() {
  await SecureStore.deleteItemAsync(LOCK_KEY);
  console.log("🔓 Lock global liberado");
}
