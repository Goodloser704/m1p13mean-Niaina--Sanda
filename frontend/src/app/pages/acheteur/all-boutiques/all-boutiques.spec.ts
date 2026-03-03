import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBoutiques } from './all-boutiques';

describe('AllBoutiques', () => {
  let component: AllBoutiques;
  let fixture: ComponentFixture<AllBoutiques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllBoutiques]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllBoutiques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
