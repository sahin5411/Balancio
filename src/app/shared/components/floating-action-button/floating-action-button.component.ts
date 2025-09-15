import { Component, OnDestroy, HostListener, ElementRef, OnInit, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { GlobalTransactionModalService } from '../../services/global-transaction-modal.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss']
})
export class FloatingActionButtonComponent implements OnInit, OnDestroy {
  showMenu = false;
  isModalOpen = false;
  isMobile = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private globalModalService: GlobalTransactionModalService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.checkScreenSize();
    
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

  ngOnInit() {
    // Force high z-index and ensure visibility
    this.ensureVisibility();
  }

  private ensureVisibility() {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'z-index', '9999');
    this.renderer.setStyle(element, 'position', 'relative');
    this.renderer.setStyle(element, 'display', 'block');
    this.renderer.setStyle(element, 'visibility', 'visible');
    this.renderer.setStyle(element, 'opacity', '1');
    
    if (this.isMobile) {
      this.renderer.addClass(element, 'mobile-fab-visible');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    this.ensureVisibility();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 640;
    }
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