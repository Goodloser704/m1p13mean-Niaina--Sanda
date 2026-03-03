import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.getToken();

  const apiUrl = environment;
  const excludedUrls: string[] = [];

  const requiresAuth = !excludedUrls.some(url => req.url.includes(url));


  if (token && requiresAuth) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        console.warn("401 Unauthorized Error Detected. Login page redirection ...");
        auth.logOut();
      }
      return throwError(() => err);
    })
  );
};
