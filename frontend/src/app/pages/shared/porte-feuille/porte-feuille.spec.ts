import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorteFeuille } from './porte-feuille';

describe('PorteFeuille', () => {
  let component: PorteFeuille;
  let fixture: ComponentFixture<PorteFeuille>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PorteFeuille]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorteFeuille);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
