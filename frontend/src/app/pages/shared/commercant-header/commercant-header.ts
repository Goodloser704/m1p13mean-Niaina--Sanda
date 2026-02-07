import { Component, computed, signal } from '@angular/core';
import { TitleCasePipe } from "@angular/common";
import { CentreCommercialService } from '../../../core/services/admin/centre-commercial.service';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth.service';
import { Dialog } from "../../../components/shared/dialog/dialog";

@Component({
  selector: 'app-commercant-header',
  imports: [TitleCasePipe, Dialog],
  templateUrl: './commercant-header.html',
  styleUrl: './commercant-header.scss',
})
export class CommercantHeader {
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
