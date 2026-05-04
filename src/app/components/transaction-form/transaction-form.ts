import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { Category } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './transaction-form.html',
  styleUrls: ['./transaction-form.css']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      type: ['debit', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category_id: ['', Validators.required],
      description: [''],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  async ngOnInit() {
    this.categories = await this.databaseService.getCategories();
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      await this.databaseService.addTransaction(this.transactionForm.value);
      this.router.navigate(['/dashboard']);
    }
  }
}
