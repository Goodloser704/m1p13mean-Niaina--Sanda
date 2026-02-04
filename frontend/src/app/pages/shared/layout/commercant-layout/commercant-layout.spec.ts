import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercantLayout } from './commercant-layout';

describe('CommercantLayout', () => {
  let component: CommercantLayout;
  let fixture: ComponentFixture<CommercantLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercantLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercantLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
