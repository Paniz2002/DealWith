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
import { StudentGuard } from './guards/student/student.guard';
import { StatisticsStudentComponent } from './components/statistics-student/statistics-student.component';
import { StatisticsModeratorComponent } from './components/statistics-moderator/statistics-moderator.component';
import {NotFoundComponent} from "./components/not-found/not-found.component";
export const routes: Routes = [
  {
    path: 'notfound',
    component: NotFoundComponent,
    pathMatch: 'full',
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
    path: 'updatepassword',
    canActivate: [AuthenticationGuard],
    component: UpdatePasswordComponent,
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    pathMatch: 'full',
    component: AdminHomepageComponent,
    children: [],
  },
  {
    path: 'create',
    component: AuctionFormComponent,
    pathMatch: 'full',
    canActivate: [StudentGuard],
  },
  {
    path: 'statistics',
    component: StatisticsStudentComponent,
    pathMatch: 'full',
    canActivate: [StudentGuard],
  },
  {
    path: 'admin/statistics',
    component: StatisticsModeratorComponent,
    pathMatch: 'full',
    canActivate: [AdminGuard],
  },
  {
    path: ':id',
    component: AuctionDetailsComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuctionListComponent,
    pathMatch: 'full',
  },

  { path: '**', component: NotFoundComponent },
];
