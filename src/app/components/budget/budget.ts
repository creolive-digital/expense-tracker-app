import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { Category, BudgetWithCategory } from '../../models/transaction.model';
import { filter, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class BudgetComponent implements OnInit {
  loading = true;
  budgets: BudgetWithCategory[] = [];
  categories: Category[] = [];
  
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();

  newBudget = {
    category_id: '',
    amount: ''
  };

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    await firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready)));
    this.categories = await this.databaseService.getCategories();
    await this.loadBudgets();
  }

  async loadBudgets() {
    this.loading = true;
    this.budgets = await this.databaseService.getBudgets(this.month, this.year);
    this.loading = false;
  }

  async addBudget() {
    if (this.newBudget.category_id && this.newBudget.amount) {
      await this.databaseService.addBudget({
        category_id: parseInt(this.newBudget.category_id),
        amount: parseFloat(this.newBudget.amount),
        month: this.month,
        year: this.year
      });
      this.newBudget = { category_id: '', amount: '' };
      await this.loadBudgets();
    }
  }

  async deleteBudget(id: number | undefined) {
    if (id && confirm('Delete this budget?')) {
      await this.databaseService.deleteBudget(id);
      await this.loadBudgets();
    }
  }

  getPercent(budget: BudgetWithCategory) {
    if (!budget.actual_spending) return 0;
    return Math.min((budget.actual_spending / budget.amount) * 100, 100);
  }

  getStatusColor(budget: BudgetWithCategory) {
    const percent = this.getPercent(budget);
    if (percent > 90) return 'var(--danger)';
    if (percent > 70) return 'var(--warning)';
    return 'var(--success)';
  }

  getMonthName() {
    return new Date(this.year, this.month - 1).toLocaleString('default', { month: 'long' });
  }

  async changeMonth(delta: number) {
    this.month += delta;
    if (this.month > 12) {
      this.month = 1;
      this.year++;
    } else if (this.month < 1) {
      this.month = 12;
      this.year--;
    }
    await this.loadBudgets();
  }
}
