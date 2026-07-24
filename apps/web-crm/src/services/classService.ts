import { apiRequest } from "./apiClient";

/**
 * Envía un archivo (.pdf, .md, .txt) al servidor usando FormData
 * evitando errores de tamaño de payload (PayloadTooLargeError).
 */
export async function parseClassFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiRequest("/modules/theory/parse-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al escanear archivo: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en parseClassFile:", error);
    throw error;
  }
}

/**
 * Obtiene la lista completa de módulos teóricos
 */
export async function getTheoreticalModules() {
  try {
    const response = await apiRequest("/modules/theory").catch(() => null);
    if (!response || !response.ok) return [];
    return await response.json();
  } catch (error) {
    console.warn("No se pudo obtener la lista de módulos desde el servidor:", error);
    return [];
  }
}

/**
 * Obtiene el detalle de una clase/módulo teórico por ID
 */
export async function getTheoreticalModuleById(id: string) {
  try {
    const response = await apiRequest(`/modules/theory/${id}`).catch(() => null);
    if (!response || !response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn(`No se pudo obtener el módulo ${id} desde el servidor:`, error);
    return null;
  }
}

/**
 * Guarda/Publica una nueva clase teórica
 */
export async function saveTheoreticalClass(payload: Record<string, any>) {
  try {
    const response = await apiRequest("/modules/theory", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar la clase: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en saveTheoreticalClass:", error);
    throw error;
  }
}

/**
 * Actualiza una clase teórica existente
 */
export async function updateTheoreticalClass(
  id: string,
  payload: Record<string, any>,
) {
  try {
    const response = await apiRequest(`/modules/theory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar la clase: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error actualizando modulo ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina una clase teórica
 */
export async function deleteTheoreticalClass(id: string) {
  try {
    const response = await apiRequest(`/modules/theory/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error(`Error eliminando modulo ${id}:`, error);
    return false;
  }
}

