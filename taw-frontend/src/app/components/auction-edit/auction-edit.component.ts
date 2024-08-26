import {Component, Input} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn} from "@angular/forms";
import {Router} from "@angular/router";
import {AuctionService} from "../../services/bid/auction.service";
import {MatDialog} from "@angular/material/dialog";
import {NotificationService} from "../../services/popup/notification.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {EditorModule} from "@tinymce/tinymce-angular";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

function isbnLengthValidator(): ValidatorFn{
  return (control: AbstractControl) => {
    if(control.value === ""){
      return null;
    }
    if (control.value.length !== 10 && control.value.length !== 13) {
      return {isbnLength: true};
    }
    return null;
  };
}

@Component({
  selector: 'app-auction-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    EditorModule,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepicker,
    MatNativeDateModule,
    MatGridList,
    MatGridTile,
  ],
  templateUrl: './auction-edit.component.html',
  styleUrl: './auction-edit.component.css'
})
export class AuctionEditComponent {
  @Input() auctionId!: string;
  auctionFormEdit!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private auctionFormEditBuilder: FormBuilder,
    private router: Router,
    private auctionService: AuctionService,
    private dialog: MatDialog,
    private snackBar: NotificationService,
  ) {}

  ngOnInit() {
    this.auctionFormEdit = this.auctionFormEditBuilder.group(
      {
        description: [''],
        condition: [''],
        book_title: [''],
        book_author: [''],
        ISBN: ['', isbnLengthValidator()],
        files: ['']
      }
    );
  }

  async onSubmit(): Promise<boolean> {
    if (!this.auctionFormEdit.valid) {
      this.snackBar.notify('Invalid form.');
      return false;
    }
    const auctionPatchOk = await this.auctionService.patchAuction(this.auctionFormEdit, this.auctionId);
    if (!auctionPatchOk) {
      this.snackBar.notify('Could not add new auction, please try later.');
      return false;
    }

    if(this.selectedFiles.length !== 0) {
      const imagesOk = await this.auctionService.uploadImages(
        this.auctionId,
        this.selectedFiles,
      );

      if (!imagesOk) {
        this.snackBar.notify('Error while uploading images.');
        return false;
      }
    }

    this.snackBar.notify('Auction edited successfully');

    window.location.reload();
    return true;
  }

  onFileSelected() {
    const inputNode: any = document.querySelector('#files');
    console.log(inputNode);
    this.selectedFiles = [];
    if (inputNode.files && inputNode.files.length > 0) {
      this.selectedFiles = inputNode.files;
      this.auctionFormEdit.controls['files'].setValue(this.selectedFiles);
    }
    this.generatePreviews();
  }

  private generatePreviews(): void {
    this.imagePreviews = [];
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      for (let file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
