import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UpdatepasswordComponent } from './components/update-password/updatepassword.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthenticationGuard } from './guards/auth/authentication.guard';
import { LogoutGuard } from './guards/logout/logout.guard';
import { RoleGuard } from './guards/role/role.guard';
import { AdminHomepageComponent } from './components/admin-homepage/admin-homepage.component';
import { AdminGuard } from './guards/cashier/adminGuard';
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
    path: 'updatepassword',
    component: UpdatepasswordComponent,
    pathMatch: 'full',
  },
  {
    path: 'logout',
    canActivate: [LogoutGuard],
    pathMatch: 'full',
    children: [],
  },
  {
    path: 'admin',
    canActivate: [AuthenticationGuard, AdminGuard],
    pathMatch: 'full',
    component: AdminHomepageComponent,
    children: [],
  },
  {
    path: 'homepageRedirect',
    canActivate: [RoleGuard],
    pathMatch: 'full',
    children: [],
  },

];
