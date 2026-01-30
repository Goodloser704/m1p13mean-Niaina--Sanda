import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { BoutiqueRegistrationComponent } from './boutique-registration.component';
import { AuthService } from '../../services/auth.service';
import { BoutiqueService } from '../../services/boutique.service';

describe('BoutiqueRegistrationComponent', () => {
  let component: BoutiqueRegistrationComponent;
  let fixture: ComponentFixture<BoutiqueRegistrationComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBoutiqueService: jasmine.SpyObj<BoutiqueService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: of(null),
      isLoggedIn$: of(false)
    });
    const boutiqueServiceSpy = jasmine.createSpyObj('BoutiqueService', ['registerBoutique']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BoutiqueRegistrationComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BoutiqueService, useValue: boutiqueServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoutiqueRegistrationComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockBoutiqueService = TestBed.inject(BoutiqueService) as jasmine.SpyObj<BoutiqueService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default form values', () => {
    expect(component.boutiqueForm.nom).toBe('');
    expect(component.boutiqueForm.categorie).toBe('');
    expect(component.boutiqueForm.description).toBe('');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should validate required fields', () => {
    expect(component.isFormValid()).toBeFalse();
    
    component.boutiqueForm.nom = 'Test Boutique';
    component.boutiqueForm.categorie = 'Mode';
    component.boutiqueForm.description = 'Description test';
    component.boutiqueForm.contact.telephone = '0123456789';
    component.boutiqueForm.contact.email = 'test@example.com';
    
    expect(component.isFormValid()).toBeTrue();
  });

  it('should format horaire correctly', () => {
    const horaire = { ouvert: true, ouverture: '09:00', fermeture: '18:00' };
    expect(component.formatHoraire(horaire)).toBe('09:00 - 18:00');
    
    const horaireFerme = { ouvert: false, ouverture: '', fermeture: '' };
    expect(component.formatHoraire(horaireFerme)).toBe('Fermé');
  });

  it('should apply preset schedule correctly', () => {
    component.applyPreset('standard');
    
    expect(component.boutiqueForm.horaires.lundi.ouvert).toBeTrue();
    expect(component.boutiqueForm.horaires.lundi.ouverture).toBe('09:00');
    expect(component.boutiqueForm.horaires.lundi.fermeture).toBe('18:00');
    
    expect(component.boutiqueForm.horaires.dimanche.ouvert).toBeFalse();
  });

  it('should submit form when valid', () => {
    mockBoutiqueService.registerBoutique.and.returnValue(of({ success: true, message: 'Success' }));
    
    component.boutiqueForm.nom = 'Test Boutique';
    component.boutiqueForm.categorie = 'Mode';
    component.boutiqueForm.description = 'Description test';
    component.boutiqueForm.contact.telephone = '0123456789';
    component.boutiqueForm.contact.email = 'test@example.com';
    
    component.onSubmit();
    
    expect(mockBoutiqueService.registerBoutique).toHaveBeenCalled();
  });
});