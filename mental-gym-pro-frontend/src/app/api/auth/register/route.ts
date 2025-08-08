const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Adjust port as needed

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}
interface ErrorResponse {
  message?: string;
  errors?: Array<{
    msg: string;
    param?: string;
    location?: string;
  }>;
}
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData: AuthResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      const errorResponse = responseData as ErrorResponse;
      throw new Error(
        errorResponse.message || 
        (errorResponse.errors ? errorResponse.errors.map(e => e.msg).join(', ') : 'Registration failed')
      );
    }

    return responseData as AuthResponse;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};