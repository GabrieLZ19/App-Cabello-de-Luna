const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function getCRMStudents() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/students`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching CRM students:', error);
    return [];
  }
}

export async function validatePracticeCut(cutId: string, status: 'APPROVED' | 'CORRECTION_REQUIRED', comments: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/practices/cuts/${cutId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, comments }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating practice cut:', error);
    return false;
  }
}
