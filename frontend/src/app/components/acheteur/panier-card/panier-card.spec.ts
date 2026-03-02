import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierCard } from './panier-card';

describe('PanierCard', () => {
  let component: PanierCard;
  let fixture: ComponentFixture<PanierCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanierCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
