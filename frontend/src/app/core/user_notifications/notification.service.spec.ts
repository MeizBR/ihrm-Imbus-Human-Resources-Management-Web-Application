import { TestBed } from '@angular/core/testing';

import { UserNotificationService } from './user-notification.service';

describe('NotificationService', () => {
  let service: UserNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
