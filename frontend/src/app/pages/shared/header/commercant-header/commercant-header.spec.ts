import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercantHeader } from './commercant-header';

describe('CommercantHeader', () => {
  let component: CommercantHeader;
  let fixture: ComponentFixture<CommercantHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercantHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercantHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
