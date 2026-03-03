import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchatCard } from './achat-card';

describe('AchatCard', () => {
  let component: AchatCard;
  let fixture: ComponentFixture<AchatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchatCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchatCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
