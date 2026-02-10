import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcheteurHeader } from './acheteur-header';

describe('AcheteurHeader', () => {
  let component: AcheteurHeader;
  let fixture: ComponentFixture<AcheteurHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcheteurHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcheteurHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
