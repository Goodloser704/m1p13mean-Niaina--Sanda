import { Component, computed } from '@angular/core';
import { CentreCommercialService } from '../../../core/services/admin/centre-commercial.service';
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-footer',
  imports: [TitleCasePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  centre = computed(() => this.centreCommercialService.centreCommercial()
    ?? this.centreCommercialService.getDefault()
  );
  annee: Number = new Date().getFullYear();

  constructor(private centreCommercialService: CentreCommercialService) {}
}
