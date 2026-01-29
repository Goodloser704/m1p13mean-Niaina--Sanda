import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * 🔐 Intercepteur HTTP pour ajouter automatiquement le token d'authentification
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si un token existe, l'ajouter aux headers
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('🔐 Token ajouté à la requête:', req.url);
    return next(authReq);
  }

  return next(req);
};