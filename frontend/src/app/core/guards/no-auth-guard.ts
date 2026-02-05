import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// bloquer login si déjà connecté
export const noAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  
  if (auth.isLoggedIn()) {
    const user = auth.getCurrentUser();
    if (user) {
      auth.redirectByRole(user.role);
    }
    return false;
  }
  return true;
};
