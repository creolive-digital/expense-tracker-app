import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatabaseService } from './services/database';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('expense-tracker-app');

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    await this.databaseService.initializePlugin();
  }
}
