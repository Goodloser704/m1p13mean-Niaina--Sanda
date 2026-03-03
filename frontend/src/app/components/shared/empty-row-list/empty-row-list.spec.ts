import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyRowList } from './empty-row-list';

describe('EmptyRowList', () => {
  let component: EmptyRowList;
  let fixture: ComponentFixture<EmptyRowList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyRowList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyRowList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
