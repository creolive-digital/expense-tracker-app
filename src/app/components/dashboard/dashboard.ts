import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { TransactionWithCategory } from '../../models/transaction.model';
import { filter, skip, take } from 'rxjs';

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
    // If DB is already ready, load data
    if (this.databaseService.isReady.value) {
      await this.loadDashboardData();
    } else {
      // Otherwise, wait for it in the background
      this.databaseService.isReady.pipe(
        filter(ready => ready),
        take(1)
      ).subscribe(() => {
        this.loadDashboardData();
      });
    }
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
