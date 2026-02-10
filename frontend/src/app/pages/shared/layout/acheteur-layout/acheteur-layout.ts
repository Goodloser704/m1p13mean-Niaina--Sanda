import { Component } from '@angular/core';
import { Footer } from "../../footer/footer";
import { AcheteurHeader } from "../../header/acheteur-header/acheteur-header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-acheteur-layout',
  imports: [Footer, AcheteurHeader, RouterOutlet],
  templateUrl: './acheteur-layout.html',
  styleUrl: './acheteur-layout.scss',
})
export class AcheteurLayout {
}
