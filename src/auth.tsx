import { jwtDecode } from 'jwt-decode';

export function isTokenValid(): boolean {
  let token = localStorage.getItem('token');
  if (!token) return false;

  token = token.trim();

  try {
    const decoded: any = jwtDecode(token)
    const now = Date.now() / 1000;

    if (!decoded.exp) return false;
    return decoded.exp > now;
  } catch {
    return false;
  }
}
