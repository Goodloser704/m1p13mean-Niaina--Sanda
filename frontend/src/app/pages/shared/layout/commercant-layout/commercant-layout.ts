import { Component } from '@angular/core';
import { CommercantHeader } from "../../commercant-header/commercant-header";
import { RouterOutlet } from "@angular/router";
import { Footer } from "../../footer/footer";

@Component({
  selector: 'app-commercant-layout',
  imports: [CommercantHeader, RouterOutlet, Footer],
  templateUrl: './commercant-layout.html',
  styleUrl: './commercant-layout.scss',
})
export class CommercantLayout {

}
