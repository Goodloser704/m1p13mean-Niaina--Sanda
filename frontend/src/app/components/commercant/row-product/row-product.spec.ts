import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowProduct } from './row-product';

describe('RowProduct', () => {
  let component: RowProduct;
  let fixture: ComponentFixture<RowProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
