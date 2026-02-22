import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorairesForm } from './horaires-form';

describe('HorairesForm', () => {
  let component: HorairesForm;
  let fixture: ComponentFixture<HorairesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorairesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorairesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
