import { apiRequest } from "./apiClient";

export async function getFranchises() {
  try {
    const response = await apiRequest("/franchises");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return [];
  }
}

export async function createFranchise(payload: Record<string, any>) {
  try {
    const response = await apiRequest("/franchises", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error("Error creating franchise:", error);
    throw error;
  }
}

export async function updateFranchise(id: string, payload: Record<string, any>) {
  try {
    const response = await apiRequest(`/franchises/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error(`Error updating franchise ${id}:`, error);
    throw error;
  }
}
