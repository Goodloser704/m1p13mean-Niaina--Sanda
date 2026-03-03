import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcheteurLayout } from './acheteur-layout';

describe('AcheteurLayout', () => {
  let component: AcheteurLayout;
  let fixture: ComponentFixture<AcheteurLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcheteurLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcheteurLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
