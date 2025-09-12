import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-income-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-card.component.html',
  styleUrls: ['./income-card.component.scss']
})
export class IncomeCardComponent {
  @Input() amount: number = 0;
}