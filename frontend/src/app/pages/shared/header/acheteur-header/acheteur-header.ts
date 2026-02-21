import { CentreCommercialService } from '../../../../core/services/admin/centre-commercial.service';
import { Component, computed, signal } from '@angular/core';
import { CentreCommercial } from '../../../../core/models/admin/centre-commercial.model';
import { TitleCasePipe } from "@angular/common";
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Dialog } from "../../../../components/shared/dialog/dialog";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-acheteur-header',
  templateUrl: './acheteur-header.html',
  styleUrl: './acheteur-header.scss',
    imports: [TitleCasePipe, Dialog, RouterLink]
})
export class AcheteurHeader {
  centre = computed(() =>
    this.centreCommercialService.centreCommercial()
      ?? this.centreCommercialService.getDefault()
  );
  currentUser = signal<User | null>(null);
  showLogoutDialog = signal(false);

  constructor(
    private authService: AuthService,
    private centreCommercialService: CentreCommercialService
  ) {
    this.currentUser.set(this.authService.currentUser());
  }

  onClickLogout() {
    this.showLogoutDialog.set(true);
  }

  onLogoutAnswer(answer: boolean) {
    this.showLogoutDialog.set(false);

    if (answer) {
      this.authService.logOut();
    }
  }
}
