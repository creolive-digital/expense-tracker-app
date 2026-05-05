import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatabaseService } from '../../services/database';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { filter, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  loading = true;
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  totalSpent = 0;

  // Pie Chart
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'],
      borderWidth: 0
    }]
  };
  public pieChartType: ChartType = 'pie';

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    await firstValueFrom(this.databaseService.isReady.pipe(filter(ready => ready)));
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    const spending = await this.databaseService.getCategorySpending(this.month, this.year);
    
    this.totalSpent = spending.reduce((acc, curr) => acc + curr.total, 0);
    this.pieChartData.labels = spending.map(s => s.category_name);
    this.pieChartData.datasets[0].data = spending.map(s => s.total);
    
    this.loading = false;
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
    await this.loadData();
  }

  getMonthName() {
    return new Date(this.year, this.month - 1).toLocaleString('default', { month: 'long' });
  }
}
