import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../shared/services/transaction.service';
import { CategoryService } from '../../shared/services/category.service';
import { Transaction } from '../../shared/models/transaction.model';
import { Category } from '../../shared/models/category.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  transactionForm: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  transactionId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.transactionForm = this.fb.group({
      title: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['expense', [Validators.required]],
      categoryId: ['', [Validators.required]],
      description: [''],
      date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.transactionId;
    
    if (this.isEditMode && this.transactionId) {
      this.loadTransaction(this.transactionId);
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadTransaction(id: string) {
    this.transactionService.getTransaction(id).subscribe(transaction => {
      if (transaction) {
        this.transactionForm.patchValue({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.categoryId,
          description: transaction.description,
          date: new Date(transaction.date).toISOString().split('T')[0]
        });
      }
    });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formData = this.transactionForm.value;
      const transactionData = {
        ...formData,
        date: new Date(formData.date),
        userId: '1'
      };

      if (this.isEditMode && this.transactionId) {
        this.transactionService.updateTransaction(this.transactionId, transactionData).subscribe(() => {
          this.router.navigate(['/transactions']);
        });
      } else {
        this.transactionService.createTransaction(transactionData).subscribe(() => {
          this.router.navigate(['/transactions']);
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}