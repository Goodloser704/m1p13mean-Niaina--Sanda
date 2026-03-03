import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAchats } from './gestion-achats';

describe('GestionAchats', () => {
  let component: GestionAchats;
  let fixture: ComponentFixture<GestionAchats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionAchats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionAchats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
