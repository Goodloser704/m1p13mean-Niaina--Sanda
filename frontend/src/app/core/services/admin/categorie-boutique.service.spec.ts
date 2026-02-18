import { TestBed } from '@angular/core/testing';

import { CategorieBoutiqueService } from './categorie-boutique.service';

describe('CategorieBoutiqueService', () => {
  let service: CategorieBoutiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategorieBoutiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
