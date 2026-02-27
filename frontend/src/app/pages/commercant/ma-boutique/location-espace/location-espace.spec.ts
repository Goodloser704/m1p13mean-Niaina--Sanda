import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationEspace } from './location-espace';

describe('LocationEspace', () => {
  let component: LocationEspace;
  let fixture: ComponentFixture<LocationEspace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationEspace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationEspace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
