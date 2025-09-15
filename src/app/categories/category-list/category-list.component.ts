import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { Category as CategoryModel } from '../../shared/models/category.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  transactions: number;
  totalAmount: number;
  isActive: boolean;
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalTransactions: number;
  expenseCategories: number;
  incomeCategories: number;
}
@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent, ConfirmationModalComponent],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  isLoading = false;
  activeTab: 'all' | 'expense' | 'income' = 'all';
  showMenuFor: string | null = null;
  showDeleteModal = false;
  categoryToDelete: Category | null = null;

  categoryTabs = [
    { key: 'all' as const, label: 'All Categories', icon: 'fas fa-th', color: '#6b7280', count: 7 },
    { key: 'expense' as const, label: 'Expense Categories', icon: 'fas fa-arrow-down', color: '#ef4444', count: 6 },
    { key: 'income' as const, label: 'Income Categories', icon: 'fas fa-arrow-up', color: '#10b981', count: 1 }
  ];

  categories: Category[] = [];

  stats: CategoryStats = {
    totalCategories: 7,
    activeCategories: 7,
    totalTransactions: 86,
    expenseCategories: 6,
    incomeCategories: 1
  };

  currencySymbol: string = '₹';

  constructor(
    private router: Router, 
    private categoryService: CategoryService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.loadCategories();
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showMenuFor = null;
      }
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          transactions: 0,
          totalAmount: 0,
          isActive: true
        }));
        this.updateTabCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
        this.updateTabCounts();
        this.isLoading = false;
      }
    });
  }

  get filteredCategories(): Category[] {
    if (this.activeTab === 'all') {
      return this.categories;
    }
    return this.categories.filter(cat => cat.type === this.activeTab);
  }

  updateTabCounts(): void {
    const expenseCount = this.categories.filter(cat => cat.type === 'expense').length;
    const incomeCount = this.categories.filter(cat => cat.type === 'income').length;
    
    this.categoryTabs[0].count = this.categories.length;
    this.categoryTabs[1].count = expenseCount;
    this.categoryTabs[2].count = incomeCount;

    this.stats = {
      totalCategories: this.categories.length,
      activeCategories: this.categories.filter(cat => cat.isActive).length,
      totalTransactions: this.categories.reduce((sum, cat) => sum + cat.transactions, 0),
      expenseCategories: expenseCount,
      incomeCategories: incomeCount
    };
  }

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }

  getUsagePercentage(category: Category): number {
    const maxTransactions = Math.max(...this.categories.map(cat => cat.transactions));
    return Math.round((category.transactions / maxTransactions) * 100);
  }

  toggleMenu(categoryId: string): void {
    this.showMenuFor = this.showMenuFor === categoryId ? null : categoryId;
  }

  closeMenu(): void {
    this.showMenuFor = null;
  }

  addCategory(): void {
    this.router.navigate(['/categories/new']);
  }

  editCategory(categoryId: string): void {
    this.closeMenu();
    this.router.navigate(['/categories/edit', categoryId]);
  }

  duplicateCategory(categoryId: string): void {
    this.closeMenu();
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
        name: `${category.name} (Copy)`,
        transactions: 0,
        totalAmount: 0
      };
      this.categories.push(newCategory);
      this.updateTabCounts();
    }
  }

  toggleCategoryStatus(categoryId: string): void {
    this.closeMenu();
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      category.isActive = !category.isActive;
      this.updateTabCounts();
    }
  }

  deleteCategory(categoryId: string): void {
    this.closeMenu();
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      this.categoryToDelete = category;
      this.showDeleteModal = true;
    }
  }
  
  confirmDeleteCategory(): void {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
        next: () => {
          this.loadCategories();
          this.showDeleteModal = false;
          this.categoryToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
          this.showDeleteModal = false;
          this.categoryToDelete = null;
        }
      });
    }
  }
  
  cancelDeleteCategory(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }
  
  getDeleteMessage(): string {
    if (!this.categoryToDelete) return '';
    return `Are you sure you want to delete "${this.categoryToDelete.name}"? This action cannot be undone and will affect all related transactions.`;
  }

  getProperIcon(type: string, name: string): string {
    const iconMap: { [key: string]: string } = {
      'food': 'restaurant',
      'transport': 'directions_car',
      'entertainment': 'movie',
      'utilities': 'flash_on',
      'shopping': 'shopping_bag',
      'healthcare': 'local_hospital',
      'income': 'attach_money'
    };
    const key = name.toLowerCase().split(' ')[0];
    return iconMap[key] || (type === 'income' ? 'add_circle' : 'remove_circle');
  }

  getTabIcon(key: string): string {
    const tabIcons: { [key: string]: string } = {
      'all': 'category',
      'income': 'add_circle',
      'expense': 'remove_circle'
    };
    return tabIcons[key] || 'category';
  }
}