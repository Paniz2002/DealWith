import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import axios from 'axios';

axios.defaults.withCredentials = true; // Set the default withCredentials property to true, to pass jwt cookie
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
