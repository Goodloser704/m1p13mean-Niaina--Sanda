import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole, User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles: UserRole[] = route.data['roles'];
  const user: User | null = auth.getCurrentUser();

  if (!user || !expectedRoles.includes(user.role)) {
    console.warn(`Expected Roles: ${expectedRoles}, User Role: ${user?.role}. Redirect to Login`);
    router.navigate(['/login']);
    return false;
  }

  return true;
};
