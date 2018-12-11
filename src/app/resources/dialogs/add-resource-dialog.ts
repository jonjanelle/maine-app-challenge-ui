import {Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { IAddResourceDialogData } from './IAddResourceDialogData';
import { ReactiveFormsModule } from '@angular/forms';
import { IResource } from 'src/app/interfaces/IResource';
import { ResourceService } from '../resource.service';
import { MAT_LABEL_GLOBAL_OPTIONS} from '@angular/material/core';
import {FormControl, Validators} from '@angular/forms';

interface IResourceError {
  name: string | null, 
  description: string | null,
  url: string | null
}

/**
 * @title Add resource dialog
 */
@Component({
  selector: 'add-resource-dialog',
  templateUrl: 'add-resource-dialog.html',
  styleUrls: ['add-resource-dialog.css'],
})
export class AddResourceDialog {
  public errors: IResourceError;
  public isBusy: boolean;

  constructor(
    public dialogRef: MatDialogRef<AddResourceDialog>,
    private resourceService: ResourceService,
    private snackBar: MatSnackBar,

    @Inject(MAT_DIALOG_DATA) public data: IAddResourceDialogData
  ) {
    this.resetErrors();
  }
  
  private resetErrors() {
    this.errors = {
      name: null, 
      description: null,
      url: null
    }
  }
  
  public onSave() {
    this.isBusy = true;
    this.resourceService.createResource(this.data.resource).subscribe(resource => {
      this.openSnackBar("Resource created successfully", "Success"); 
      this.dialogRef.close(this.data.resource);
    }, (error) => { 
      this.errors.name = error.error.name;
      this.errors.description = error.error.description;
      this.errors.url = error.error.url;
    }, () => {
      this.isBusy = false;
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}