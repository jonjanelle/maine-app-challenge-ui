import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, debounceTime, switchMap} from 'rxjs/operators';

//Dialogs
import { AddEventDialog } from './dialogs/add-event-dialog';

// Models/Interfaces
import { IEvent } from '../interfaces/IEvent';

//Services
import { EventService } from './event.service';
import { IAddEventDialogData } from './dialogs/IAddEventDialogData';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'view-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})

export class EventsComponent {
  public events: IEvent[];
  public displayedColumns: string[] = ['name', 'description', 'url'];
  public isBusy: boolean;
  public eventSearchCtrl: FormControl;
  public filteredEvents: Observable<IEvent[]>;
  private currentSection: string;

  constructor(private eventService: EventService, public dialog: MatDialog) { 
    this.eventSearchCtrl = new FormControl();
  }
  
  ngOnInit() {
    this.getEvents();

    this.filteredEvents = this.eventSearchCtrl.valueChanges
      .pipe(
        debounceTime(200),
        switchMap((name:string) => this.searchByName(name))
    );

  }

  public searchByName(queryString: string): Observable<IEvent[]> { 
     return this.eventService
      .getEvents([{key: "name", value: queryString}]);
  }
  
  public getEvents() {
    this.isBusy = true;
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    }, (err) => {
      console.log("getEvents(): ", err);
    }, () => {
      this.isBusy = false;
    });
  }

  public addResource(resourceType: string): void {
    let newEvent: IEvent = {
      id: 0, 
      name: "", 
      description: "", 
      url: null, 
      max_participants: null,
      cost: 0,
      start_date: null,
      end_date: null,
      address: null
    }
    this.openAddDialog({title: resourceType, event: newEvent});
  }

  openAddDialog(dialogData: IAddEventDialogData): void {
    const dialogRef = this.dialog.open(AddEventDialog, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: IEvent) => {
      if (result !== undefined) {
        this.getEvents();
      }
    });
  }

  public displayFn(resource?: IEvent): string | undefined {
    return resource ? resource.name : undefined;
  }
}