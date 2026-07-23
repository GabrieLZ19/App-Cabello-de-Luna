const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Envía un archivo (.pdf, .md, .txt) al servidor usando FormData
 * evitando errores de tamaño de payload (PayloadTooLargeError).
 */
export async function parseClassFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/modules/theory/parse-pdf`, {
      method: "POST",
      body: formData, // Fetch ajusta automáticamente los headers multipart/form-data
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
    const response = await fetch(`${API_BASE_URL}/modules/theory`).catch(() => null);
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
    const response = await fetch(`${API_BASE_URL}/modules/theory/${id}`).catch(() => null);
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
    const response = await fetch(`${API_BASE_URL}/modules/theory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    const response = await fetch(`${API_BASE_URL}/modules/theory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
    const response = await fetch(`${API_BASE_URL}/modules/theory/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error(`Error eliminando modulo ${id}:`, error);
    return false;
  }
}
