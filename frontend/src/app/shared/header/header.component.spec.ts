import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(null),
      isLoggedIn$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentUser).toBeNull();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('should emit showLogin when showLoginModal is called', () => {
    spyOn(component.showLogin, 'emit');
    component.showLoginModal();
    expect(component.showLogin.emit).toHaveBeenCalled();
  });

  it('should call authService.logout when logout is called', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should get user display name correctly', () => {
    const user = { prenom: 'John', nom: 'Doe' } as any;
    expect(component.getUserDisplayName(user)).toBe('John D.');
    
    const userNoLastName = { prenom: 'John' } as any;
    expect(component.getUserDisplayName(userNoLastName)).toBe('John');
    
    expect(component.getUserDisplayName(null)).toBe('');
  });

  it('should get role display correctly', () => {
    expect(component.getRoleDisplay('admin')).toBe('Administrateur');
    expect(component.getRoleDisplay('boutique')).toBe('Commerçant');
    expect(component.getRoleDisplay('client')).toBe('Client');
    expect(component.getRoleDisplay('unknown')).toBe('Utilisateur');
  });
});