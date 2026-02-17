import { TestBed } from '@angular/core/testing';

import { DemandesLocationService } from './demandes-location.service';

describe('DemandesLocationService', () => {
  let service: DemandesLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandesLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
