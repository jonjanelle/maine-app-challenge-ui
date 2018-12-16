import {Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { IAddEventDialogData } from './IAddEventDialogData';
import { ReactiveFormsModule } from '@angular/forms';
import { IEvent } from 'src/app/interfaces/IEvent';
import { EventService } from '../event.service';
import { MAT_LABEL_GLOBAL_OPTIONS} from '@angular/material/core';
import {FormControl, Validators} from '@angular/forms';

interface IEventError {
  name: string | null, 
  description: string | null,
  url: string | null
}

/**
 * @title Add event dialog
 */
@Component({
  selector: 'add-event-dialog',
  templateUrl: 'add-event-dialog.html',
  styleUrls: ['add-event-dialog.css'],
})
export class AddEventDialog {
  public errors: IEventError;
  public isBusy: boolean;

  constructor(
    public dialogRef: MatDialogRef<AddEventDialog>,
    private eventService: EventService,
    private snackBar: MatSnackBar,

    @Inject(MAT_DIALOG_DATA) public data: IAddEventDialogData
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
    this.eventService.createEvent(this.data.event).subscribe(event => {
      this.openSnackBar("Event created successfully", "Success"); 
      this.dialogRef.close(this.data.event);
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