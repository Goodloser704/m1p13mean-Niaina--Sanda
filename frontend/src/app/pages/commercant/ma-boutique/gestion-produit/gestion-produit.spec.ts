import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProduit } from './gestion-produit';

describe('GestionProduit', () => {
  let component: GestionProduit;
  let fixture: ComponentFixture<GestionProduit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProduit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProduit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
