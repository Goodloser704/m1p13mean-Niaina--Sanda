import { Component } from '@angular/core';
import { AcheteurHeader } from "../../acheteur-header/acheteur-header";
import { SwiperSlide } from "../../../../components/shared/swiper-slide/swiper-slide";
import { Footer } from "../../footer/footer";

@Component({
  selector: 'app-template-layout',
  imports: [AcheteurHeader, SwiperSlide, Footer],
  templateUrl: './template-layout.html',
  styleUrl: './template-layout.scss',
})
export class TemplateLayout {

}
