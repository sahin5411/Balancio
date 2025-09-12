import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent {
  category = {
    name: '',
    type: 'expense',
    icon: 'category',
    color: '#3b82f6'
  };

  icons = [
    'restaurant', 'directions_car', 'shopping_bag', 'flash_on', 'movie', 
    'local_hospital', 'attach_money', 'home', 'school', 'fitness_center'
  ];

  colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  constructor(private router: Router) {}

  onSubmit(): void {
    console.log('Category created:', this.category);
    this.router.navigate(['/categories']);
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}