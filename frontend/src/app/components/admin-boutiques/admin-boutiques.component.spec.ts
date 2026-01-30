import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AdminBoutiquesComponent } from './admin-boutiques.component';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { BoutiqueService } from '../../services/boutique.service';
import { NotificationService } from '../../services/notification.service';

describe('AdminBoutiquesComponent', () => {
  let component: AdminBoutiquesComponent;
  let fixture: ComponentFixture<AdminBoutiquesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockBoutiqueService: jasmine.SpyObj<BoutiqueService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of(null),
      isLoggedIn$: of(false)
    });
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getAllBoutiques', 'approveBoutique', 'rejectBoutique'
    ]);
    const boutiqueServiceSpy = jasmine.createSpyObj('BoutiqueService', ['getBoutiqueById']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['refreshNotifications']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockBoutiqueService = TestBed.inject(BoutiqueService) as jasmine.SpyObj<BoutiqueService>;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.boutiques).toEqual([]);
    expect(component.isLoading).toBeTrue();
    expect(component.selectedBoutique).toBeNull();
    expect(component.currentView).toBe('list');
  });

  it('should load boutiques on init', () => {
    mockAdminService.getAllBoutiques.and.returnValue(of({ boutiques: [] }));
    component.ngOnInit();
    expect(mockAdminService.getAllBoutiques).toHaveBeenCalled();
  });

  it('should filter boutiques by status', () => {
    const mockBoutiques = [
      { _id: '1', statut: 'pending' },
      { _id: '2', statut: 'approved' },
      { _id: '3', statut: 'rejected' }
    ] as any[];
    
    component.boutiques = mockBoutiques;
    
    expect(component.getFilteredBoutiques('pending').length).toBe(1);
    expect(component.getFilteredBoutiques('approved').length).toBe(1);
    expect(component.getFilteredBoutiques('rejected').length).toBe(1);
    expect(component.getFilteredBoutiques('all').length).toBe(3);
  });

  it('should format status correctly', () => {
    expect(component.getStatusLabel('pending')).toBe('En attente');
    expect(component.getStatusLabel('approved')).toBe('Approuvée');
    expect(component.getStatusLabel('rejected')).toBe('Rejetée');
    expect(component.getStatusLabel('unknown')).toBe('Inconnu');
  });
});