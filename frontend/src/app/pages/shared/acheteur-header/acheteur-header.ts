import { CentreCommercialService } from './../../../core/services/admin/centre-commercial.service';
import { Component, computed, OnInit, WritableSignal } from '@angular/core';
import { CentreCommercial } from '../../../core/models/centre-commercial';
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: 'app-acheteur-header',
  templateUrl: './acheteur-header.html',
  styleUrl: './acheteur-header.scss',
    imports: [TitleCasePipe]
})
export class AcheteurHeader {
  centre = computed(() =>
    this.centreCommercialService.centreCommercial()
      ?? this.centreCommercialService.getDefault()
  );

  constructor(
    private centreCommercialService: CentreCommercialService
  ) {}
}
