import { CentreCommercialService } from './centre-commercial.service';
import { TestBed } from '@angular/core/testing';

describe('CentreCommercial', () => {
  let service: CentreCommercialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentreCommercialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
