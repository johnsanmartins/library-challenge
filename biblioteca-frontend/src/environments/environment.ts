export const environment = {
  production: false,
  apiUrl: '/api/v1',
  keycloak: {
    issuer: 'http://localhost:8180/realms/library',
    clientId: 'library-frontend',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: false,
    showDebugInformation: true,
    useSilentRefresh: false
  }
};
