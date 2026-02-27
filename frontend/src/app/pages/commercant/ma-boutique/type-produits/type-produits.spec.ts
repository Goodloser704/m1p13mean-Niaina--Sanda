import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeProduits } from './type-produits';

describe('TypeProduits', () => {
  let component: TypeProduits;
  let fixture: ComponentFixture<TypeProduits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeProduits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeProduits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
