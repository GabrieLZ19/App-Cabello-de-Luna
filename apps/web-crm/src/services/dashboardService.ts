import { apiRequest } from "./apiClient";

export async function getDashboardStats() {
  try {
    const response = await apiRequest("/users/stats");
    if (!response.ok) return { totalStudents: 0 };
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { totalStudents: 0 };
  }
}
