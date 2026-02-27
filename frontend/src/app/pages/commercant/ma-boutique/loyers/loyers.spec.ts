import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loyers } from './loyers';

describe('Loyers', () => {
  let component: Loyers;
  let fixture: ComponentFixture<Loyers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loyers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loyers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
