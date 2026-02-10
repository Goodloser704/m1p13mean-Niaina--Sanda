import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfil } from './user-profil';

describe('UserProfil', () => {
  let component: UserProfil;
  let fixture: ComponentFixture<UserProfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
