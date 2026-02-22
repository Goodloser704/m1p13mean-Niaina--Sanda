import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaBoutique } from './ma-boutique';

describe('MaBoutique', () => {
  let component: MaBoutique;
  let fixture: ComponentFixture<MaBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
