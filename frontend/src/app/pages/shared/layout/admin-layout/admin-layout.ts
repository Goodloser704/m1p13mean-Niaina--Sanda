import { Component } from '@angular/core';
import { Footer } from "../../footer/footer";
import { SwiperSlide } from "../../../../components/shared/swiper-slide/swiper-slide";
import { AcheteurHeader } from "../../acheteur-header/acheteur-header";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin-layout',
  imports: [Footer, SwiperSlide, AcheteurHeader, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {

}
