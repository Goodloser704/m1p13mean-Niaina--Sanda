import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AdminBoutiquesComponent } from './admin-boutiques.component';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { BoutiqueService } from '../../services/boutique.service';
import { NotificationService } from '../../services/notification.service';

describe('AdminBoutiquesComponent', () => {
  let component: AdminBoutiquesComponent;
  let fixture: ComponentFixture<AdminBoutiquesComponent>;
  let mockAuthService: any;
  let mockAdminService: any;
  let mockBoutiqueService: any;
  let mockNotificationService: any;
  let mockRouter: any;

  beforeEach(async () => {
    const authServiceSpy = {
      getCurrentUser: vi.fn(),
      currentUser$: of(null),
      isLoggedIn$: of(false)
    };
    const adminServiceSpy = {
      getAllBoutiques: vi.fn(),
      approveBoutique: vi.fn(),
      rejectBoutique: vi.fn()
    };
    const boutiqueServiceSpy = {
      getBoutiqueById: vi.fn()
    };
    const notificationServiceSpy = {
      refreshNotifications: vi.fn()
    };
    const routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AdminBoutiquesComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: BoutiqueService, useValue: boutiqueServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBoutiquesComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService);
    mockAdminService = TestBed.inject(AdminService);
    mockBoutiqueService = TestBed.inject(BoutiqueService);
    mockNotificationService = TestBed.inject(NotificationService);
    mockRouter = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.boutiques).toEqual([]);
    expect(component.isLoading).toBe(true);
    expect(component.selectedBoutique).toBeNull();
  });

  it('should load boutiques on init', () => {
    mockAdminService.getAllBoutiques.mockReturnValue(of({ boutiques: [] }));
    component.ngOnInit();
    expect(mockAdminService.getAllBoutiques).toHaveBeenCalled();
  });

});