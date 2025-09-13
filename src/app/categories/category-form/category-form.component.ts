import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {
  category = {
    name: '',
    type: 'expense' as 'expense' | 'income',
    icon: 'category',
    color: '#3b82f6'
  };

  isEditMode = false;
  categoryId: string | null = null;

  icons = [
    'restaurant', 'directions_car', 'shopping_bag', 'flash_on', 'movie', 
    'local_hospital', 'attach_money', 'home', 'school', 'fitness_center'
  ];

  colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.categoryId;
    
    if (this.isEditMode && this.categoryId) {
      this.loadCategory();
    }
  }

  loadCategory(): void {
    if (!this.categoryId) return;
    
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const category = categories.find(c => c.id === this.categoryId);
        if (category) {
          this.category = {
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
          };
        } else {
          alert('Category not found');
          this.router.navigate(['/categories']);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        alert('Failed to load category');
        this.router.navigate(['/categories']);
      }
    });
  }

  onSubmit(): void {
    if (!this.category.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const categoryData = {
      name: this.category.name.trim(),
      type: this.category.type,
      color: this.category.color,
      icon: this.category.icon
    };

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, categoryData).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          console.error('Error updating category:', error);
          alert('Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory(categoryData as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          console.error('Error creating category:', error);
          alert('Failed to create category');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}