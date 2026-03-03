import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { inject, Injectable, Type } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Dialog } from '../../components/shared/dialog/dialog';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private overlay = inject(Overlay);

  open<T, R = any>(
    component: Type<T>,
    config?: { data?: any }
  ) {

    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });

    const portal = new ComponentPortal(component);
    const componentRef = overlayRef.attach(portal);

    // Inject data dynamiquement
    if (config?.data) {
      Object.assign(componentRef.instance as any, config.data);
    }

    const close$ = new Subject<R>();

    // On injecte une fonction close dans le component
    (componentRef.instance as any).close = (result: R) => {
      close$.next(result);
      close$.complete();
      overlayRef.dispose();
    };

    overlayRef.backdropClick().subscribe(() => {
      close$.complete();
      overlayRef.dispose();
    });

    return close$.asObservable();
  }
}
