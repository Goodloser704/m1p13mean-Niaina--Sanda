import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationBoutique } from './creation-boutique';

describe('CreationBoutique', () => {
  let component: CreationBoutique;
  let fixture: ComponentFixture<CreationBoutique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationBoutique]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationBoutique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
