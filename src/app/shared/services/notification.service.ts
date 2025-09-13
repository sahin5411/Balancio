import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info' | 'error';
  time: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  addNotification(notification: Omit<Notification, 'id' | 'time' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false
    };
    
    const current = this.notifications.value;
    this.notifications.next([newNotification, ...current]);
  }

  markAsRead(id: string): void {
    const current = this.notifications.value;
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifications.next(updated);
  }

  markAllAsRead(): void {
    const current = this.notifications.value;
    const updated = current.map(n => ({ ...n, read: true }));
    this.notifications.next(updated);
  }

  getUnreadCount(): Observable<number> {
    return new BehaviorSubject(
      this.notifications.value.filter(n => !n.read).length
    ).asObservable();
  }
}