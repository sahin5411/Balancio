import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../shared/services/category.service';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  activeTab: 'all' | 'expense' | 'income' = 'all';
  showMenuFor: string | null = null;

  categoryTabs = [
    { key: 'all' as const, label: 'All Categories', icon: 'fas fa-th', color: '#6b7280', count: 7 },
    { key: 'expense' as const, label: 'Expense Categories', icon: 'fas fa-arrow-down', color: '#ef4444', count: 6 },
    { key: 'income' as const, label: 'Income Categories', icon: 'fas fa-arrow-up', color: '#10b981', count: 1 }
  ];

  categories: Category[] = [
    {
      id: '1',
      name: 'Food & Dining',
      type: 'expense',
      icon: 'utensils',
      color: '#f59e0b',
      transactions: 23,
      totalAmount: 1245.67,
      isActive: true
    },
    {
      id: '2',
      name: 'Transportation',
      type: 'expense',
      icon: 'car',
      color: '#3b82f6',
      transactions: 15,
      totalAmount: 687.45,
      isActive: true
    },
    {
      id: '3',
      name: 'Shopping',
      type: 'expense',
      icon: 'shopping-bag',
      color: '#8b5cf6',
      transactions: 18,
      totalAmount: 523.11,
      isActive: true
    },
    {
      id: '4',
      name: 'Utilities',
      type: 'expense',
      icon: 'bolt',
      color: '#eab308',
      transactions: 8,
      totalAmount: 398.45,
      isActive: true
    },
    {
      id: '5',
      name: 'Entertainment',
      type: 'expense',
      icon: 'film',
      color: '#ec4899',
      transactions: 12,
      totalAmount: 189.32,
      isActive: true
    },
    {
      id: '6',
      name: 'Healthcare',
      type: 'expense',
      icon: 'heart',
      color: '#ef4444',
      transactions: 6,
      totalAmount: 525.78,
      isActive: true
    },
    {
      id: '7',
      name: 'Income',
      type: 'income',
      icon: 'dollar-sign',
      color: '#10b981',
      transactions: 4,
      totalAmount: 5500.00,
      isActive: true
    }
  ];

  stats: CategoryStats = {
    totalCategories: 7,
    activeCategories: 7,
    totalTransactions: 86,
    expenseCategories: 6,
    incomeCategories: 1
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateTabCounts();
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showMenuFor = null;
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
    if (category && confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      this.categories = this.categories.filter(cat => cat.id !== categoryId);
      this.updateTabCounts();
    }
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