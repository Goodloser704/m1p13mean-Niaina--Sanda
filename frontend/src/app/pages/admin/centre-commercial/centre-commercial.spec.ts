import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentreCommercial } from './centre-commercial';

describe('CentreCommercial', () => {
  let component: CentreCommercial;
  let fixture: ComponentFixture<CentreCommercial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentreCommercial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentreCommercial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
