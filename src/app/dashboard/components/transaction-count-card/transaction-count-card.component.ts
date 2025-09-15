import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-count-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-count-card.component.html',
  styleUrls: ['./transaction-count-card.component.scss']
})
export class TransactionCountCardComponent {
  @Input() totalCount: number = 0;
  @Input() incomeCount: number = 0;
  @Input() expenseCount: number = 0;
}