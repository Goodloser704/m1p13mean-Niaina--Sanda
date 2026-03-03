import { AfterViewInit, Component } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';


Swiper.use([Autoplay, Pagination]);

@Component({
  selector: 'app-swiper-slide',
  imports: [],
  templateUrl: './swiper-slide.html',
  styleUrl: './swiper-slide.scss',
})
export class SwiperSlide implements AfterViewInit {
  ngAfterViewInit(): void {
    new Swiper('.clients-swiper', {
      loop: true,
      speed: 600,
      autoplay: {
        delay: 5000
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 40 },
        480: { slidesPerView: 3, spaceBetween: 60 },
        640: { slidesPerView: 4, spaceBetween: 80 },
        992: { slidesPerView: 6, spaceBetween: 120 }
      }
    });
  }

}
