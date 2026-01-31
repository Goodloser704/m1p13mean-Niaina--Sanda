import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockAuthService: any;
  let mockNotificationService: any;
  let mockRouter: any;

  const mockUser = {
    _id: '1',
    nom: 'Doe',
    prenom: 'John',
    email: 'john.doe@example.com',
    role: 'client',
    telephone: '0123456789',
    adresse: '123 Rue Test',
    dateNaissance: '1990-01-01',
    genre: 'homme'
  };

  beforeEach(async () => {
    const authServiceSpy = {
      currentUser$: of(mockUser),
      updateProfile: vi.fn().mockReturnValue(of({ success: true })),
      changePassword: vi.fn().mockReturnValue(of({ success: true })),
      deleteAccount: vi.fn().mockReturnValue(of({ success: true })),
      refreshCurrentUser: vi.fn(),
      logout: vi.fn()
    };

    const notificationServiceSpy = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    const routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService);
    mockNotificationService = TestBed.inject(NotificationService);
    mockRouter = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isLoading).toBe(false);
    expect(component.isEditing).toBe(false);
    expect(component.showPasswordForm).toBe(false);
    expect(component.profileForm).toBeDefined();
    expect(component.passwordForm).toBeDefined();
  });

  it('should load user profile on init', () => {
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should toggle edit mode', () => {
    component.toggleEdit();
    expect(component.isEditing).toBe(true);
    
    component.toggleEdit();
    expect(component.isEditing).toBe(false);
  });

  it('should toggle password form', () => {
    component.togglePasswordForm();
    expect(component.showPasswordForm).toBe(true);
    
    component.togglePasswordForm();
    expect(component.showPasswordForm).toBe(false);
  });

  it('should identify user roles correctly', () => {
    component.currentUser = { ...mockUser, role: 'admin' };
    expect(component.isAdmin()).toBe(true);
    expect(component.isProprietaire()).toBe(false);
    expect(component.isClient()).toBe(false);

    component.currentUser = { ...mockUser, role: 'proprietaire' };
    expect(component.isAdmin()).toBe(false);
    expect(component.isProprietaire()).toBe(true);
    expect(component.isClient()).toBe(false);

    component.currentUser = { ...mockUser, role: 'client' };
    expect(component.isAdmin()).toBe(false);
    expect(component.isProprietaire()).toBe(false);
    expect(component.isClient()).toBe(true);
  });

  it('should return correct role labels', () => {
    component.currentUser = { ...mockUser, role: 'admin' };
    expect(component.getRoleLabel()).toBe('Administrateur');

    component.currentUser = { ...mockUser, role: 'proprietaire' };
    expect(component.getRoleLabel()).toBe('Propriétaire de boutique');

    component.currentUser = { ...mockUser, role: 'client' };
    expect(component.getRoleLabel()).toBe('Client');
  });

  it('should submit profile update', () => {
    component.currentUser = mockUser;
    component.profileForm.patchValue({
      nom: 'Updated Name',
      prenom: 'Updated First Name',
      email: 'updated@example.com'
    });

    component.onSubmitProfile();

    expect(mockAuthService.updateProfile).toHaveBeenCalled();
  });

  it('should submit password change', () => {
    component.passwordForm.patchValue({
      currentPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123'
    });

    component.onSubmitPassword();

    expect(mockAuthService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldpass',
      newPassword: 'newpass123'
    });
  });

  it('should validate password match', () => {
    component.passwordForm.patchValue({
      newPassword: 'password123',
      confirmPassword: 'different123'
    });

    expect(component.passwordForm.hasError('passwordMismatch')).toBe(true);
  });
});