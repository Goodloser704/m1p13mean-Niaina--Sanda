import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoutiquesAdmin } from './boutiques-admin';

describe('BoutiquesAdmin', () => {
  let component: BoutiquesAdmin;
  let fixture: ComponentFixture<BoutiquesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoutiquesAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoutiquesAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
