import { apiRequest } from "./apiClient";

export async function getCRMStudents() {
  try {
    const response = await apiRequest("/users/students");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching CRM students:", error);
    return [];
  }
}

export async function getCRMStaff() {
  try {
    const response = await apiRequest("/users/staff");
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching CRM staff:", error);
    return [];
  }
}

export async function createCRMUser(payload: Record<string, any>) {
  try {
    const response = await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error("Error creating CRM user:", error);
    throw error;
  }
}

export async function updateCRMUser(id: string, payload: Record<string, any>) {
  try {
    const response = await apiRequest(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error(`Error updating CRM user ${id}:`, error);
    throw error;
  }
}
