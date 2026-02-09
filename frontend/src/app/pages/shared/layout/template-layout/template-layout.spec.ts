import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateLayout } from './template-layout';

describe('TemplateLayout', () => {
  let component: TemplateLayout;
  let fixture: ComponentFixture<TemplateLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
