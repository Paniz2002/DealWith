import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthenticationGuard } from './guards/auth/authentication.guard';
import { LogoutGuard } from './guards/logout/logout.guard';
import { RoleGuard } from './guards/role/role.guard';
import { CashierHomepageComponent } from './components/cashier-homepage/cashier-homepage.component';
import { CashierGuard } from './guards/cashier/cashier.guard';
export const routes: Routes = [
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
    canActivate: [LogoutGuard],
    pathMatch: 'full',
    children: [],
  },
  {
    path: 'cashier',
    canActivate: [AuthenticationGuard, CashierGuard],
    pathMatch: 'full',
    component: CashierHomepageComponent,
    children: [],
  },
  {
    path: 'homepageRedirect',
    canActivate: [RoleGuard],
    pathMatch: 'full',
    children: [],
  },
];
