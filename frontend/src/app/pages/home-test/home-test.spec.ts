import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTest } from './home-test';

describe('HomeTest', () => {
  let component: HomeTest;
  let fixture: ComponentFixture<HomeTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
