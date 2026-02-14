import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Espaces } from './espaces';

describe('Espaces', () => {
  let component: Espaces;
  let fixture: ComponentFixture<Espaces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Espaces]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Espaces);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
