export const environment = {
  production: true,
  apiUrl: '/api/v1',
  keycloak: {
    issuer: '${KEYCLOAK_ISSUER}',
    clientId: 'library-frontend',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: false,
    showDebugInformation: false,
    useSilentRefresh: false
  }
};
