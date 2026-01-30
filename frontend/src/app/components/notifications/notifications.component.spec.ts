import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NotificationsComponent } from './notifications.component';
import { NotificationService } from '../../services/notification.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'getNotifications', 'refreshNotifications', 'markAsRead', 'markAllAsRead', 
      'archiveNotification', 'getNotificationIcon', 'getPriorityColor', 'getRelativeTime'
    ], {
      notifications$: of([]),
      unreadCount$: of(0)
    });
    
    const adminServiceSpy = jasmine.createSpyObj('AdminService', ['approveBoutique', 'rejectBoutique']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    mockNotificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.notifications).toEqual([]);
    expect(component.unreadCount).toBe(0);
    expect(component.selectedFilter).toBe('all');
  });

  it('should load notifications on init', () => {
    mockNotificationService.getNotifications.and.returnValue(of({ notifications: [], total: 0 }));
    component.ngOnInit();
    expect(mockNotificationService.getNotifications).toHaveBeenCalled();
  });

  it('should filter notifications correctly', () => {
    const mockNotifications = [
      { _id: '1', isRead: false, actionRequired: true },
      { _id: '2', isRead: true, actionRequired: false },
      { _id: '3', isRead: false, actionRequired: false }
    ] as any[];
    
    component.notifications = mockNotifications;
    
    component.setFilter('unread');
    expect(component.getFilteredNotifications().length).toBe(2);
    
    component.setFilter('action');
    expect(component.getFilteredNotifications().length).toBe(1);
    
    component.setFilter('all');
    expect(component.getFilteredNotifications().length).toBe(3);
  });
});