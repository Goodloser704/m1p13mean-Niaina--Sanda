import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiqueHome } from './boutique-home';

describe('BoutiqueHome', () => {
  let component: BoutiqueHome;
  let fixture: ComponentFixture<BoutiqueHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiqueHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiqueHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
