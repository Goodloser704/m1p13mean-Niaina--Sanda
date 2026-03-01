import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionChoice } from './inscription-choice';

describe('InscriptionChoice', () => {
  let component: InscriptionChoice;
  let fixture: ComponentFixture<InscriptionChoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionChoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionChoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
