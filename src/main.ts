import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

jeepSqlite(window);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
