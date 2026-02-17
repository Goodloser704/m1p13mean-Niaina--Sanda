import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesLocation } from './demandes-location';

describe('DemandesLocation', () => {
  let component: DemandesLocation;
  let fixture: ComponentFixture<DemandesLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesLocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesLocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
