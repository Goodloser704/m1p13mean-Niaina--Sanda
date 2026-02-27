import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesBoutiques } from './mes-boutiques';

describe('MesBoutiques', () => {
  let component: MesBoutiques;
  let fixture: ComponentFixture<MesBoutiques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesBoutiques]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesBoutiques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
