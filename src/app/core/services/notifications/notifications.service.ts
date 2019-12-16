import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationRequest } from '@core/model/notifications.model';
import { filter } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  getAllNotifications() {
    return this.http.get<Notification[]>('/api/user/my/notifications');
  }
  public getNotification(notificationUid: string): Notification {
    return filter(this.notifications, { notificationUid })[0];
  }

  set notifications(notifications: Notification[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): Notification[] {
    return this.notifications$.value;
  }
  public getNotificationDetails(notificationId): Observable<any> {
    return this.http.get<any>(`/api/user/my/notifications/${notificationId}`);
  }
  public approveOwnership(ownershipChangeRequestId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/ownershipRequest/${ownershipChangeRequestId}`, data);
  }
  public setNoticationViewed(notificationUid: string): Observable<Notification> {
    return this.http.post<any>(`/api/user/my/notifications/${notificationUid}`, { isViewed: true });
  }
  public approve() {
    let data = {
      createdByUserUID: 'f0f955cc-0d54-4b98-8902-9a110c3d0b16',
      notificationUid: 'b5ca5429-d8e1-453b-b26b-ed112549b26b',
      type: 'LINKTOPARENTAPPROVED',
      approvalStatus: 'APPROVED',
      rejectionReason: null,
      subEstablishmentId: 143,
      parentEstablishmentId: 12142,
    };
    return this.http.put<any>(`/api/establishment/7732dd6e-3fcc-42d3-a652-09e06d4f386b/linkToParent/action`, data);
  }
}
