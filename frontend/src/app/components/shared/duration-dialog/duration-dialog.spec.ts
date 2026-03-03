import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationDialog } from './duration-dialog';

describe('DurationDialog', () => {
  let component: DurationDialog;
  let fixture: ComponentFixture<DurationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DurationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
