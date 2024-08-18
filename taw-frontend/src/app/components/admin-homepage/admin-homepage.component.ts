import {
  inject,
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/popup/notification.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { RegisterComponent } from '../register/register.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
interface Student {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-admin-homepage',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    RegisterComponent,
    MatDialogModule,
  ],
  templateUrl: './admin-homepage.component.html',
  styleUrls: ['./admin-homepage.component.css'],
})
export class AdminHomepageComponent implements AfterViewInit {
  students: MatTableDataSource<Student> = new MatTableDataSource<Student>();
  displayedColumns: Array<String> = [
    'select',
    '_id',
    'username',
    'firstName',
    'lastName',
  ];
  selection = new SelectionModel<Student>(true, []);
  dialog: MatDialog;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: NotificationService,
    private changes: ChangeDetectorRef,
  ) {
    this.dialog = inject(MatDialog);
  }

  ngAfterViewInit(): void {
    axios
      .get(environments.BACKEND_URL + '/api/admin/students')
      .then((res) => {
        const studentsData = res.data.map((student: any) => ({
          _id: student._id,
          username: student.username,
          firstName: student.profile.firstName,
          lastName: student.profile.lastName,
        }));
        this.students.data = studentsData;
        this.students.paginator = this.paginator;
        this.students.sort = this.sort;
        this.changes.detectChanges();
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          this.snackBar.notify(err.response?.data.message);
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.students.filter = filterValue.trim().toLowerCase();

    if (this.students.paginator) {
      this.students.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.students.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.students.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Student): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row._id}`;
  }

  async onSubmit(): Promise<void> {
    if (this.selection.selected.length === 0) {
      this.snackBar.notify("You can't select 0 students.");
      return;
    }
    let component = this.dialog.open(DialogComponent);
    component.afterClosed().subscribe(async (dialogResult) => {
      if (!dialogResult) return;
      const res = await axios.delete(
        environments.BACKEND_URL + '/api/admin/students',
        { data: { users: this.selection.selected } },
      );
      if (res.status === 200) {
        this.snackBar.notify('Students deleted successfully!');
        // Fetch again the API to have the updated students list.
        // This way if we have a new student registering we find it immediatly
        // instead of waiting for a page reload.
        const res = await axios.get(
          environments.BACKEND_URL + '/api/admin/students',
        );
        this.students.data = res.data.map((student: any) => ({
          _id: student._id,
          username: student.username,
          firstName: student.profile.firstName,
          lastName: student.profile.lastName,
        }));
        this.changes.detectChanges();
      }
    });
  }
}
