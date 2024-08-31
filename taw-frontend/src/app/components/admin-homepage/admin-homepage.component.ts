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
import { MatButton } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    RegisterComponent,
    MatDialogModule,
    MatButton,
  ],
  templateUrl: './admin-homepage.component.html',
  styleUrls: ['./admin-homepage.component.css'],
})
export class AdminHomepageComponent implements AfterViewInit {
  addUni: FormGroup;
  addCourse: FormGroup;
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
  cities: any;
  universities: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: NotificationService,
    private changes: ChangeDetectorRef,
    private form: FormBuilder,
  ) {
    this.dialog = inject(MatDialog);
    this.addUni = this.form.group({
      name: ['', [Validators.required]],
      city: ['', [Validators.required]],
    });
    this.addCourse = this.form.group({
      name: ['', [Validators.required]],
      university: ['', [Validators.required]],
      year1: ['', [Validators.required]],
      year2: ['', [Validators.required]],
    });
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

    axios.get(environments.BACKEND_URL + '/api/admin/cities').then((res) => {
      this.cities = res.data;
    });

    axios
      .get(environments.BACKEND_URL + '/api/admin/universities')
      .then((res) => {
        this.universities = res.data;
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
    let component = this.dialog.open(DialogComponent, {
      data: {
        title: 'Delete students',
        content: 'Are you sure you want to delete the selected students?',
      },
    });
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
        // TODO: socket?
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

  async addUniversity() {
    if (this.addUni.valid) {
      const res = await axios.post(
        environments.BACKEND_URL + '/api/admin/universities',
        {
          name: this.addUni.controls['name'].value,
          cityID: this.addUni.controls['city'].value,
        },
      );
      if (res.status !== 200) {
        this.snackBar.notify('Error with request.');
      }
      this.snackBar.notify('University added.');
    } else {
      this.snackBar.notify('Invalid form.');
      return;
    }
  }
  async addCourseToUni() {
    if (!this.addCourse.valid) {
      console.log(this.addCourse.errors);
      this.snackBar.notify('Invalid form.');
      return;
    }
    const res = await axios.post(
      environments.BACKEND_URL + '/api/admin/courses',
      {
        name: this.addCourse.controls['name'].value,
        university: this.addCourse.controls['university'].value,
        year1: this.addCourse.controls['year1'].value,
        year2: this.addCourse.controls['year2'].value,
      },
    );
    if (res.status !== 200) {
      this.snackBar.notify('Error with request.');
      return;
    }
    this.snackBar.notify('Course added.');
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
