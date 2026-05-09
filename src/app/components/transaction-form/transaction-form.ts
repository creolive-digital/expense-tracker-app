import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { Category } from '../../models/transaction.model';
import { filter, firstValueFrom } from 'rxjs';

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
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private router: Router
  ) {
    const today = new Date();
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().substring(0, 10);
    
    this.transactionForm = this.fb.group({
      type: ['debit', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category_id: ['', Validators.required],
      description: [''],
      date: [localDate, Validators.required]
    });
  }

  async ngOnInit() {
    await firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready)));
    this.categories = await this.databaseService.getCategories();
  }

  async onSubmit() {
    if (this.transactionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      try {
        await this.databaseService.addTransaction(this.transactionForm.value);
        this.router.navigate(['/dashboard']);
      } catch (err) {
        console.error('Submission failed', err);
        this.isSubmitting = false;
      }
    }
  }
}
