import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalTransactionModalService } from '../../services/global-transaction-modal.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss']
})
export class FloatingActionButtonComponent implements OnDestroy {
  showMenu = false;
  isModalOpen = false;
  
  private destroy$ = new Subject<void>();

  constructor(private globalModalService: GlobalTransactionModalService) {
    // Subscribe to modal state to hide FAB when modal is open
    this.globalModalService.isModalOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOpen => {
        this.isModalOpen = isOpen;
        if (isOpen) {
          this.showMenu = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  addExpense(): void {
    this.globalModalService.openModal('expense');
    this.showMenu = false;
  }

  addIncome(): void {
    this.globalModalService.openModal('income');
    this.showMenu = false;
  }

  closeMenu(): void {
    this.showMenu = false;
  }
}