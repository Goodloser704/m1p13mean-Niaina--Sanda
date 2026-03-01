import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyGridList } from './empty-grid-list';

describe('EmptyGridList', () => {
  let component: EmptyGridList;
  let fixture: ComponentFixture<EmptyGridList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyGridList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyGridList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
