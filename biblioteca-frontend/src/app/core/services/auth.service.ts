import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loggedInSubject = new BehaviorSubject<boolean>(false);
  private readonly profileSubject = new BehaviorSubject<Record<string, unknown> | null>(null);
  private readonly initializedSubject = new BehaviorSubject<boolean>(false);

  readonly isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();
  readonly userProfile$: Observable<Record<string, unknown> | null> = this.profileSubject.asObservable();
  /** Emite true cuando el proceso de init de auth terminó (con o sin Keycloak) */
  readonly initialized$: Observable<boolean> = this.initializedSubject.asObservable();

  private keycloakAvailable = false;

  constructor(private oauthService: OAuthService) {}

  initAuth(): void {
    const authConfig: AuthConfig = {
      issuer: environment.keycloak.issuer,
      clientId: environment.keycloak.clientId,
      redirectUri: environment.keycloak.redirectUri,
      responseType: environment.keycloak.responseType,
      scope: environment.keycloak.scope,
      requireHttps: environment.keycloak.requireHttps,
      showDebugInformation: environment.keycloak.showDebugInformation,
      useSilentRefresh: false
    };

    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        this.keycloakAvailable = true;
        this.updateLoginState();
        this.initializedSubject.next(true);
      })
      .catch(() => {
        // Keycloak no disponible — modo local sin autenticación
        this.keycloakAvailable = false;
        this.loggedInSubject.next(false);
        this.initializedSubject.next(true);
      });

    this.oauthService.events.subscribe(() => this.updateLoginState());
  }

  login(): void {
    if (this.keycloakAvailable) {
      this.oauthService.initCodeFlow();
    }
  }

  logout(): void {
    this.oauthService.logOut();
    this.loggedInSubject.next(false);
    this.profileSubject.next(null);
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  isKeycloakAvailable(): boolean {
    return this.keycloakAvailable;
  }

  private updateLoginState(): void {
    const loggedIn = this.oauthService.hasValidAccessToken();
    this.loggedInSubject.next(loggedIn);
    if (loggedIn) {
      this.profileSubject.next(this.oauthService.getIdentityClaims() as Record<string, unknown>);
    }
  }
}
