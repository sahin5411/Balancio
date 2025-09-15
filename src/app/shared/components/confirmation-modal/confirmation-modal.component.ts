import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4" 
               [ngClass]="getIconBackgroundClass()">
            <span class="material-icons text-2xl" [ngClass]="getIconColorClass()">
              {{ icon }}
            </span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 text-center mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-500 text-center mb-6">{{ message }}</p>
          <div class="flex space-x-3">
            <button 
              (click)="onCancel()"
              class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
              {{ cancelText }}
            </button>
            <button 
              (click)="onConfirm()"
              class="flex-1 px-4 py-2 rounded-md transition-colors font-medium"
              [ngClass]="getConfirmButtonClass()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fixed {
      animation: fadeIn 0.15s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .relative {
      animation: slideIn 0.15s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: scale(0.95) translateY(-10px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' | 'success' = 'danger';
  @Input() icon: string = 'warning';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getIconBackgroundClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      case 'success':
        return 'bg-green-100';
      default:
        return 'bg-red-100';
    }
  }

  getIconColorClass(): string {
    switch (this.type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'success':
        return 'bg-green-600 text-white hover:bg-green-700';
      default:
        return 'bg-red-600 text-white hover:bg-red-700';
    }
  }
}