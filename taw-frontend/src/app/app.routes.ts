import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UpdatePasswordComponent } from './components/update-password/updatepassword.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthenticationGuard } from './guards/auth/authentication.guard';
import { LogoutGuard } from './guards/logout/logout.guard';
import { AdminHomepageComponent } from './components/admin-homepage/admin-homepage.component';
import { AuctionFormComponent } from './components/auction-form/auction-form.component';
import { AdminGuard } from './guards/admin/adminGuard';
import { AuctionListComponent } from './components/auction-list/auction-list.component';
import { StudentGuard } from './guards/student/student.guard';
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
    canActivate: [AuthenticationGuard],
    component: UpdatePasswordComponent,
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
    canActivate: [AdminGuard],
    pathMatch: 'full',
    component: AdminHomepageComponent,
    children: [],
  },
  {
    path: 'auction',
    pathMatch: 'full',
    component: AuctionListComponent,
    canActivateChild: [StudentGuard],
    children: [
      {
        path: 'create',
        component: AuctionFormComponent,
        pathMatch: 'full',
      },
    ],
  },
];
