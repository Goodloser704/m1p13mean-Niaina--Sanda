import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of(null),
      isLoggedIn$: of(false)
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.isLoggedIn).toBeFalse();
    expect(component.currentView).toBe('home');
  });

  it('should navigate to correct route when setView is called', () => {
    component.setView('notifications');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/notifications']);
  });

  it('should navigate to home when setView is called with home', () => {
    component.setView('home');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});