import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { inject, Injectable } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Dialog } from '../../components/shared/dialog/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;

  open(message: string, callback: (result: boolean) => void) {

    // Création overlay centré
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'dialog-panel',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });

    // Fermer si click backdrop
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });

    // Attacher ton component
    const portal = new ComponentPortal(Dialog);
    const componentRef = this.overlayRef.attach(portal);

    componentRef.instance.dialog = message;

    componentRef.instance.dialogResponse.subscribe(result => {
      callback(result);
      this.close();
    });
  }

  close() {
    this.overlayRef?.dispose();
  }
}
