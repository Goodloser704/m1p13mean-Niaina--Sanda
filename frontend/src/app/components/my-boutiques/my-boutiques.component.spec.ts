import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { MyBoutiquesComponent } from './my-boutiques.component';
import { AuthService } from '../../services/auth.service';
import { BoutiqueService } from '../../services/boutique.service';

describe('MyBoutiquesComponent', () => {
  let component: MyBoutiquesComponent;
  let fixture: ComponentFixture<MyBoutiquesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBoutiqueService: jasmine.SpyObj<BoutiqueService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of({ _id: 'user1', role: 'boutique' }),
      isLoggedIn$: of(true)
    });
    const boutiqueServiceSpy = jasmine.createSpyObj('BoutiqueService', [
      'getUserBoutiques', 'deleteBoutique'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MyBoutiquesComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BoutiqueService, useValue: boutiqueServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyBoutiquesComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockBoutiqueService = TestBed.inject(BoutiqueService) as jasmine.SpyObj<BoutiqueService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.boutiques).toEqual([]);
    expect(component.isLoading).toBeTrue();
    expect(component.currentUser).toBeNull();
  });

  it('should load user boutiques on init', () => {
    mockBoutiqueService.getUserBoutiques.and.returnValue(of({ boutiques: [] }));
    component.ngOnInit();
    expect(mockBoutiqueService.getUserBoutiques).toHaveBeenCalled();
  });

  it('should get status label correctly', () => {
    expect(component.getStatusLabel('pending')).toBe('En attente');
    expect(component.getStatusLabel('approved')).toBe('Approuvée');
    expect(component.getStatusLabel('rejected')).toBe('Rejetée');
    expect(component.getStatusLabel('unknown')).toBe('Inconnu');
  });

  it('should get status color correctly', () => {
    expect(component.getStatusColor('pending')).toBe('#ffc107');
    expect(component.getStatusColor('approved')).toBe('#28a745');
    expect(component.getStatusColor('rejected')).toBe('#dc3545');
    expect(component.getStatusColor('unknown')).toBe('#6c757d');
  });

  it('should format horaire correctly', () => {
    const horaire = { ouvert: true, ouverture: '09:00', fermeture: '18:00' };
    expect(component.formatHoraire(horaire)).toBe('09:00 - 18:00');
    
    const horaireFerme = { ouvert: false, ouverture: '', fermeture: '' };
    expect(component.formatHoraire(horaireFerme)).toBe('Fermé');
  });

  it('should navigate to boutique registration', () => {
    component.createNewBoutique();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/boutique-registration']);
  });

  it('should delete boutique when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockBoutiqueService.deleteBoutique.and.returnValue(of({ success: true, message: 'Deleted' }));
    
    component.deleteBoutique('boutique1');
    
    expect(mockBoutiqueService.deleteBoutique).toHaveBeenCalledWith('boutique1');
  });
});