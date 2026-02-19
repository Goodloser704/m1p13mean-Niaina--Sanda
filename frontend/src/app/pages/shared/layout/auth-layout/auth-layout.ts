import { Component, computed } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { CentreCommercialService } from '../../../../core/services/admin/centre-commercial.service';
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, TitleCasePipe],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  centreCommercialName = computed(() => 
    this.ccService.centreCommercial()?.nom ?? this.ccService.getDefault().nom
  )
  year = new Date().getFullYear();

  constructor(private ccService: CentreCommercialService) {}
}
