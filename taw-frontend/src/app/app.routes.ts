import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { authenticationGuard } from './guards/auth/authentication.guard';
import { logoutGuard } from './guards/logout/logout.guard';
import { roleGuard } from './guards/role/role.guard';
export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
    pathMatch: 'full',
    canActivate: [authenticationGuard, roleGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'logout',
    canActivate: [logoutGuard],
    pathMatch: 'full',
    children: [],
  },
];
