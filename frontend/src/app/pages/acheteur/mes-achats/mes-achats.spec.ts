import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesAchats } from './mes-achats';

describe('MesAchats', () => {
  let component: MesAchats;
  let fixture: ComponentFixture<MesAchats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesAchats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesAchats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
