import { Component } from '@angular/core';
import { Footer } from "../../footer/footer";
import { AcheteurHeader } from "../../acheteur-header/acheteur-header";
import { SwiperSlide } from "../../../../components/shared/swiper-slide/swiper-slide";

@Component({
  selector: 'app-acheteur-layout',
  imports: [Footer, AcheteurHeader, SwiperSlide],
  templateUrl: './acheteur-layout.html',
  styleUrl: './acheteur-layout.scss',
})
export class AcheteurLayout {
}
