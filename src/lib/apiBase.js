export const API = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');


export const ENDPOINT = {
  userProfile: `${API}/user/profile`,
  tests: `${API}/tests`,
  login: `${API}/login`,
  logout:         `${API}/logout`,
  testById: id => `${API}/tests/${id}`,
  testsOverview:  `${API}/tests/overview`,
  importLegacy:   `${API}/import-legacy`,
  numberOfUsers:  `${API}/admin/users/count`,
};
