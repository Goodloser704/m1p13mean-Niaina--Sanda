import { CentreCommercialService } from '../../../../core/services/admin/centre-commercial.service';
import { Component, computed, signal } from '@angular/core';
import { CentreCommercial } from '../../../../core/models/admin/centre-commercial.model';
import { TitleCasePipe } from "@angular/common";
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Dialog } from "../../../../components/shared/dialog/dialog";
import { RouterLink } from "@angular/router";
import { DialogService } from '../../../../core/services/dialog.service';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-acheteur-header',
  templateUrl: './acheteur-header.html',
  styleUrl: './acheteur-header.scss',
    imports: [TitleCasePipe, RouterLink]
})
export class AcheteurHeader {
  centre = computed(() =>
    this.centreCommercialService.centreCommercial()
      ?? this.centreCommercialService.getDefault()
  );
  currentUser = signal<User | null>(null);

  constructor(
    private authService: AuthService,
    private centreCommercialService: CentreCommercialService,
    private dialogService: DialogService
  ) {
    this.currentUser.set(this.authService.currentUser());
  }

  logOut() {
    this.dialogService
      .open(Dialog, {
        data: { message: "Voulez-vous vraiment vous déconnecter ?" }
      })
      .pipe(filter(result => result === true))
      .subscribe({
        next: () => this.authService.logOut(),
        error: console.error
      })
  }
}
