import Keycloak from "keycloak-js";

// Keycloak設定
const keycloakConfig = {
  url: process.env.KEYCLOAK_CLIENT_URL || 'http://localhost:80',
  realm: process.env.KEYCLOAK_REALM || 'microservice-app',
  clientId: process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'todo-frontend-client',
};

let keycloakInstance: Keycloak | null = null;

export function getKeycloakInstance(): Keycloak {
  if (typeof window === 'undefined') {
    throw new Error('Keycloak can only be initialized on the client side');
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }

  return keycloakInstance;
}

export async function initKeycloak(): Promise<boolean> {
  const keycloak = getKeycloakInstance();

  try {
    return await keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256',
    });
  } catch (error) {
    console.error('Keycloak initialization failed:', error);
    return false;
  }
}

export async function loginWithKeycloak(): Promise<void> {
  const keycloak = getKeycloakInstance();

  // 初期化していない場合は初期化
  if (!keycloak.didInitialize) {
    await keycloak.init({
      checkLoginIframe: false,
      pkceMethod: 'S256',
    });
  }

  // ログイン実行(initの完了を待ってから実行)
  await keycloak.login({
    redirectUri: window.location.origin + '/callback',
  });
}
export async function loginWithGoogle(): Promise<void> {
  const keycloak = getKeycloakInstance();

  // 初期化していない場合は初期化
  if (!keycloak.didInitialize) {
    await keycloak.init({
      checkLoginIframe: false,
      pkceMethod: 'S256',
    });
  }

  // Google経由でログイン実行
  await keycloak.login({
    idpHint: 'google',
    redirectUri: window.location.origin + '/callback',
  });
}

export async function logoutKeycloak(): Promise<void> {
  const keycloak = getKeycloakInstance();
  await keycloak.logout({
    redirectUri: window.location.origin + '/login',
  });
}

export function getKeycloakToken(): string | undefined {
  return keycloakInstance?.token;
}
