import { Routes } from '@angular/router';
import { AdminHomepageComponent } from './components/admin-homepage/admin-homepage.component';
import { AuctionDetailsComponent } from './components/auction-details/auction-details.component';
import { AuctionFormComponent } from './components/auction-form/auction-form.component';
import { AuctionListComponent } from './components/auction-list/auction-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RouteNotFoundComponent } from './components/route-not-found/route-not-found.component';
import { UpdatePasswordComponent } from './components/update-password/updatepassword.component';
import { AdminGuard } from './guards/admin/adminGuard';
import { AuthenticationGuard } from './guards/auth/authentication.guard';
import { LogoutGuard } from './guards/logout/logout.guard';
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
    component: AuctionListComponent,
    pathMatch: 'full',
  },
  {
    path: 'auction/:id',
    component: AuctionDetailsComponent,
    pathMatch: 'full',
  },
  {
    // Ideally we'd have auction and then {path: create...} children
    // but it's not possibile.
    path: 'auction/create',
    component: AuctionFormComponent,
    pathMatch: 'full',
    canActivate: [StudentGuard],
  },
  { path: '*', pathMatch: 'full', component: RouteNotFoundComponent },
];
