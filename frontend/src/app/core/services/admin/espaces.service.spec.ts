import { TestBed } from '@angular/core/testing';

import { EspacesService } from './espaces.service';

describe('EspacesService', () => {
  let service: EspacesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EspacesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
