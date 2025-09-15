import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalTransactionModalService {
  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  private transactionTypeSubject = new BehaviorSubject<'income' | 'expense'>('expense');

  constructor() {}

  get isModalOpen$(): Observable<boolean> {
    return this.isModalOpenSubject.asObservable();
  }

  get transactionType$(): Observable<'income' | 'expense'> {
    return this.transactionTypeSubject.asObservable();
  }

  openModal(type: 'income' | 'expense' = 'expense'): void {
    this.transactionTypeSubject.next(type);
    this.isModalOpenSubject.next(true);
  }

  closeModal(): void {
    this.isModalOpenSubject.next(false);
  }

  get isModalOpen(): boolean {
    return this.isModalOpenSubject.value;
  }

  get transactionType(): 'income' | 'expense' {
    return this.transactionTypeSubject.value;
  }
}