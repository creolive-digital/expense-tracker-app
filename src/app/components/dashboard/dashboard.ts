import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { TransactionWithCategory } from '../../models/transaction.model';
import { filter, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  balance = { credit: 0, debit: 0, balance: 0 };
  recentTransactions: TransactionWithCategory[] = [];
  loading = false; // Always show UI immediately
  error: string | null = null;

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    await firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready)));
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.balance = await this.databaseService.getBalance();
      this.recentTransactions = await this.databaseService.getTransactions();
      this.recentTransactions = this.recentTransactions.slice(0, 5);
    } catch (err) {
      this.error = 'Unable to fetch data from local storage.';
    }
  }
}
