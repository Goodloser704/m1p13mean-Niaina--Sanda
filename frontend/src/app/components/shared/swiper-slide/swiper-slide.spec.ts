import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperSlide } from './swiper-slide';

describe('SwiperSlide', () => {
  let component: SwiperSlide;
  let fixture: ComponentFixture<SwiperSlide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwiperSlide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwiperSlide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
