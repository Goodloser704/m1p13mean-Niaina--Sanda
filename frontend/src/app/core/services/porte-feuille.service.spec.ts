import { TestBed } from '@angular/core/testing';

import { PorteFeuilleService } from './porte-feuille.service';

describe('PorteFeuilleService', () => {
  let service: PorteFeuilleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PorteFeuilleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
