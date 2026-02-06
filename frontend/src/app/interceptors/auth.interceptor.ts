  import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * 🔐 Intercepteur HTTP pour ajouter automatiquement le token d'authentification
 * et gérer les erreurs d'authentification
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Routes qui ne nécessitent PAS de token
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/health'
    // Note: Les routes ci-dessous nécessitent l'authentification en production
    // '/api/boutiques',
    // '/api/produits',
    // '/api/categories-boutique',
    // '/api/types-produit'
  ];
  
  // Vérifier si la requête est vers une route publique
  const isPublicRoute = publicRoutes.some(route => {
    // Retirer les query params pour la comparaison
    const urlWithoutQuery = req.url.split('?')[0];
    // Vérifier si l'URL contient la route publique
    return urlWithoutQuery.includes(route);
  });
  
  let authReq = req;
  
  // N'ajouter le token QUE si ce n'est PAS une route publique
  if (!isPublicRoute) {
    const token = authService.getToken();
    
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('🔐 Token ajouté à la requête:', req.url);
    } else {
      console.warn('⚠️ Aucun token disponible pour:', req.url);
    }
  } else {
    console.log('🌐 Route publique (pas de token):', req.url);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ [AUTH-INTERCEPTOR] Erreur HTTP:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message,
        error: error.error
      });

      // Gestion spécifique des erreurs d'authentification
      if (error.status === 401) {
        console.warn('🚨 [AUTH-INTERCEPTOR] Erreur 401 - Token invalide ou expiré');
        
        // Déconnecter l'utilisateur si le token est invalide
        if (authService.isAuthenticated()) {
          console.log('🚪 [AUTH-INTERCEPTOR] Déconnexion automatique due à un token invalide');
          authService.logout();
          
          // Rediriger vers la page de connexion si nécessaire
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
        
        // Retourner une erreur JSON standardisée
        const authError = new HttpErrorResponse({
          error: { 
            message: 'Session expirée. Veuillez vous reconnecter.',
            code: 'AUTH_EXPIRED'
          },
          status: 401,
          statusText: 'Unauthorized',
          url: error.url || undefined
        });
        
        return throwError(() => authError);
      }

      // Gestion des erreurs de parsing (HTML au lieu de JSON)
      if (error.error instanceof ProgressEvent || 
          (typeof error.error === 'string' && error.error.includes('<html'))) {
        console.warn('🔧 [AUTH-INTERCEPTOR] Erreur de parsing - Réponse HTML reçue au lieu de JSON');
        
        const parseError = new HttpErrorResponse({
          error: { 
            message: 'Erreur de communication avec le serveur. Veuillez réessayer.',
            code: 'PARSE_ERROR',
            originalStatus: error.status
          },
          status: error.status || 500,
          statusText: error.statusText || 'Parse Error',
          url: error.url || undefined
        });
        
        return throwError(() => parseError);
      }

      // Gestion des erreurs de réseau
      if (error.status === 0) {
        console.warn('🌐 [AUTH-INTERCEPTOR] Erreur de réseau - Serveur inaccessible');
        
        const networkError = new HttpErrorResponse({
          error: { 
            message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
            code: 'NETWORK_ERROR'
          },
          status: 0,
          statusText: 'Network Error',
          url: error.url || undefined
        });
        
        return throwError(() => networkError);
      }

      // Retourner l'erreur originale pour les autres cas
      return throwError(() => error);
    })
  );
};