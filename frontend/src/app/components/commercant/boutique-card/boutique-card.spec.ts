import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueCard } from './boutique-card';

describe('BoutiqueCard', () => {
  let component: BoutiqueCard;
  let fixture: ComponentFixture<BoutiqueCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
