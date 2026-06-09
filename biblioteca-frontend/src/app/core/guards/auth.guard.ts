import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  return authService.initialized$.pipe(
    filter(initialized => initialized),   // esperar a que termine el init
    take(1),
    map(() => {
      // Keycloak no está disponible → acceso libre (modo local / sin Docker)
      if (!authService.isKeycloakAvailable()) {
        return true;
      }

      // Keycloak disponible → verificar sesión activa
      if (authService.isLoggedIn()) {
        return true;
      }

      // No autenticado → redirigir al login de Keycloak
      authService.login();
      return false;
    })
  );
};
