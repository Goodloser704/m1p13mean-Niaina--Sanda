import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LoginModalComponent } from './login-modal.component';
import { AuthService } from '../../services/auth.service';

describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);

    await TestBed.configureTestingModule({
      imports: [LoginModalComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModalComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isVisible).toBeFalse();
    expect(component.isLoginMode).toBeTrue();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should show modal when show() is called', () => {
    component.show();
    expect(component.isVisible).toBeTrue();
    expect(component.errorMessage).toBe('');
  });

  it('should hide modal when hide() is called', () => {
    component.hide();
    expect(component.isVisible).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('should toggle between login and register modes', () => {
    expect(component.isLoginMode).toBeTrue();
    
    component.toggleMode();
    expect(component.isLoginMode).toBeFalse();
    expect(component.errorMessage).toBe('');
    
    component.toggleMode();
    expect(component.isLoginMode).toBeTrue();
  });

  it('should validate login form', () => {
    expect(component.isLoginFormValid()).toBeFalse();
    
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';
    
    expect(component.isLoginFormValid()).toBeTrue();
  });

  it('should validate register form', () => {
    expect(component.isRegisterFormValid()).toBeFalse();
    
    component.registerForm.email = 'test@example.com';
    component.registerForm.password = 'password123';
    component.registerForm.prenom = 'John';
    component.registerForm.nom = 'Doe';
    component.registerForm.role = 'client';
    
    expect(component.isRegisterFormValid()).toBeTrue();
  });

  it('should handle successful login', () => {
    mockAuthService.login.and.returnValue(of({ success: true, user: { email: 'test@example.com' } }));
    spyOn(component.loginSuccess, 'emit');
    
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'password123';
    
    component.onLogin();
    
    expect(mockAuthService.login).toHaveBeenCalled();
    expect(component.loginSuccess.emit).toHaveBeenCalled();
    expect(component.isVisible).toBeFalse();
  });

  it('should handle login error', () => {
    mockAuthService.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    
    component.loginForm.email = 'test@example.com';
    component.loginForm.password = 'wrongpassword';
    
    component.onLogin();
    
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle successful registration', () => {
    mockAuthService.register.and.returnValue(of({ success: true, user: { email: 'test@example.com' } }));
    spyOn(component.loginSuccess, 'emit');
    
    component.registerForm.email = 'test@example.com';
    component.registerForm.password = 'password123';
    component.registerForm.prenom = 'John';
    component.registerForm.nom = 'Doe';
    component.registerForm.role = 'client';
    
    component.onRegister();
    
    expect(mockAuthService.register).toHaveBeenCalled();
    expect(component.loginSuccess.emit).toHaveBeenCalled();
    expect(component.isVisible).toBeFalse();
  });
});