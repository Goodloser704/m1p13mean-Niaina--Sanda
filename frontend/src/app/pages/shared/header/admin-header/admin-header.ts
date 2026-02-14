import { Component, computed, signal } from '@angular/core';
import { CentreCommercialService } from '../../../../core/services/admin/centre-commercial.service';
import { TitleCasePipe } from "@angular/common";
import { User } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Dialog } from "../../../../components/shared/dialog/dialog";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-admin-header',
  imports: [TitleCasePipe, Dialog, RouterLink],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
})
export class AdminHeader {
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
    this.currentUser.set(this.authService.getCurrentUser());
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
