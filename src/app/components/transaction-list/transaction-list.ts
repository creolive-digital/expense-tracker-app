import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { TransactionWithCategory, Category } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.css']
})
export class TransactionListComponent implements OnInit {
  transactions: TransactionWithCategory[] = [];
  categories: Category[] = [];

  filters = {
    type: '',
    categoryId: '',
    date: '',
    month: '',
    year: ''
  };

  years: number[] = [];

  constructor(private databaseService: DatabaseService) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear - i);
    }
  }

  async ngOnInit() {
    this.categories = await this.databaseService.getCategories();
    await this.loadTransactions();
  }

  async loadTransactions() {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.filters.date) {
      startDate = this.filters.date;
      endDate = this.filters.date;
    } else if (this.filters.month && this.filters.year) {
      const month = parseInt(this.filters.month);
      const year = parseInt(this.filters.year);
      startDate = new Date(year, month - 1, 1).toISOString().substring(0, 10);
      endDate = new Date(year, month, 0).toISOString().substring(0, 10);
    } else if (this.filters.year) {
      const year = parseInt(this.filters.year);
      startDate = new Date(year, 0, 1).toISOString().substring(0, 10);
      endDate = new Date(year, 11, 31).toISOString().substring(0, 10);
    }

    this.transactions = await this.databaseService.getTransactions({
      type: this.filters.type || undefined,
      categoryId: this.filters.categoryId ? parseInt(this.filters.categoryId) : undefined,
      startDate,
      endDate
    });
  }

  async deleteTransaction(id: number | undefined) {
    if (id && confirm('Are you sure you want to delete this transaction?')) {
      await this.databaseService.deleteTransaction(id);
      await this.loadTransactions();
    }
  }

  async clearFilters() {
    this.filters = {
      type: '',
      categoryId: '',
      date: '',
      month: '',
      year: ''
    };
    await this.loadTransactions();
  }
}
