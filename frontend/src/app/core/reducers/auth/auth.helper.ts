import { USER_SESSION } from '../../../config';
import { UserSessionDetails } from '../../../shared/models/user-models/user-session-data';

export function storeUserSession(userSession: UserSessionDetails): void {
  localStorage.setItem(USER_SESSION, JSON.stringify(userSession));
}

export function removeItems(): void {
  localStorage.clear();
}

export function getJwtToken(): string {
  return loadUserFromLocalStorage()?.token || '';
}

export function loadUserFromLocalStorage(): UserSessionDetails {
  // NOTE: It's better to get only the token
  return <UserSessionDetails>JSON.parse(localStorage.getItem(USER_SESSION));
}
