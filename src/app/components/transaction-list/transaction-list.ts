import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { TransactionWithCategory, Category } from '../../models/transaction.model';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { filter, firstValueFrom } from 'rxjs';

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
    year: '',
    searchTerm: ''
  };

  years: number[] = [];

  constructor(private databaseService: DatabaseService) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.years.push(currentYear - i);
    }
  }

  async ngOnInit() {
    await firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready)));
    this.categories = await this.databaseService.getCategories();
    await this.loadTransactions();
  }

  async loadTransactions() {
    let startDate: string | undefined;
    let endDate: string | undefined;

    const toLocalISO = (date: Date) => {
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().substring(0, 10);
    };

    if (this.filters.date) {
      startDate = this.filters.date;
      endDate = this.filters.date;
    } else if (this.filters.month && this.filters.year) {
      const month = parseInt(this.filters.month);
      const year = parseInt(this.filters.year);
      startDate = toLocalISO(new Date(year, month - 1, 1));
      endDate = toLocalISO(new Date(year, month, 0));
    } else if (this.filters.year) {
      const year = parseInt(this.filters.year);
      startDate = toLocalISO(new Date(year, 0, 1));
      endDate = toLocalISO(new Date(year, 11, 31));
    }

    this.transactions = await this.databaseService.getTransactions({
      type: this.filters.type || undefined,
      categoryId: this.filters.categoryId ? parseInt(this.filters.categoryId) : undefined,
      startDate,
      endDate,
      searchTerm: this.filters.searchTerm
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
      year: '',
      searchTerm: ''
    };
    await this.loadTransactions();
  }

  async exportToCSV() {
    if (this.transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    // Check permissions on Android/iOS
    if (Capacitor.getPlatform() !== 'web') {
      const status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        const requestStatus = await Filesystem.requestPermissions();
        if (requestStatus.publicStorage !== 'granted') {
          alert('Storage permission is required to export files.');
          return;
        }
      }
    }

    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    
    const rows = this.transactions.map(t => [
      t.date,
      escapeCsv(t.description || ''),
      escapeCsv(t.category_name),
      t.type,
      t.amount.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const fileName = `transactions_${new Date().toISOString().substring(0, 10)}.csv`;

    if (Capacitor.getPlatform() === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        alert(`Exported to Documents folder: ${fileName}`);
      } catch (e) {
        console.error('Unable to write file', e);
        alert('Export failed.');
      }
    }
  }
}
