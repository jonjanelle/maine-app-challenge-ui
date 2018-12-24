import {Component, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import {MatSort, MatTableDataSource, MatChipInputEvent, MatDialog,
        MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, debounceTime, switchMap} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

//Dialogs
import { AddResourceDialog } from './dialogs/add-resource-dialog';

//Enums
import { ResourceType } from '../enums/ResourceType';

// Models/Interfaces
import { IResource } from '../interfaces/IResource';
import { IResourceSection } from '../interfaces/IResourceSection';
import { IKeyValuePair } from '../interfaces/IKeyValuePair';

//Services
import { ResourceService } from './resource.service';
import { IAddResourceDialogData } from './dialogs/IAddResourceDialogData';
import { isNullOrUndefined } from 'util';
import { AppService } from '../app.service';

@Component({
  selector: 'view-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})

export class ResourcesComponent implements OnInit {
  public resourceSections: IResourceSection[];
  public resources: IResource[];
  public displayedColumns: string[] = ['name', 'description', 'url'];
  public isBusy: boolean;
  public resourceSearchCtrl: FormControl;
  public filteredResources: Observable<IResource[]>;
  public dataSources: MatTableDataSource<IResource>[]; 
  public isMobile: boolean;
  
  // Category filter chip controls
  public visible = true;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public categoryCtrl = new FormControl();
  public filteredCategories: Observable<string[]>;
  public categories: string[] = [];
  // TODO: retrieve categories from server. 
  public allCategories: string[] = ['Android', 'iOS', 'App Inventor', 'Code.Org'];
  //

  private currentSection: string;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
 


  constructor(
    public resourceService: ResourceService, 
    public dialog: MatDialog,
    public appService: AppService
  ) { 
    this.getResources();
    this.isMobile = window.innerWidth <= 768;
  }
  
  ngOnInit() {
    this.resourceSearchCtrl = new FormControl();
    this.filteredResources = this.resourceSearchCtrl.valueChanges
      .pipe(
        debounceTime(250),
        switchMap((name:string) => this.searchByName(name))
    );

    this.filteredResources.subscribe(fr => {
      this.resourceSections.find(rs => rs.title == this.currentSection).resources = fr;
    });
    this.filteredCategories = this.categoryCtrl.valueChanges.pipe(
      startWith(null),
      map((category: string | null) => category ? this._filter(category) : this.allCategories.slice()));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = event.target.innerWidth <= 768;
  }
  
  public setCurrentSection(index: number) {
    if (this.resourceSections[index]) 
      this.currentSection = this.resourceSections[index].title;
  }

  public searchByName(queryString: string): Observable<IResource[]> { 
    let filters: IKeyValuePair<string, string>[] = [{key: "name", value: queryString}];
    if (!isNullOrUndefined(ResourceType[this.currentSection])) {
      filters.push({key: "resource_type_id", value: ResourceType[this.currentSection]});
    }
     
    return this.resourceService.getResources(filters);
  }
  
  public getResources() {
    this.isBusy = true;
    this.resourceService.getResources().subscribe(resources => {
      this.resources = resources;
      this.setResourceSections();
      if (isNullOrUndefined(this.dataSources) || this.dataSources.length === 0) {
        this.dataSources = this.resourceSections.map(rs => new MatTableDataSource(rs.resources));
        this.dataSources.forEach(ds => ds.sort = this.sort);
      }
    }, (err) => {
      console.log("getResources(): ", err);
    }, () => {
      this.isBusy = false;
    });
  }
  
  // Category filter methods //
  /////////////////////////////
  public addFilterCategory(event: MatChipInputEvent): void {
    // Add only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      
      if (!isNullOrUndefined(value) && value.trim().length > 0) {
        this.categories.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.categoryCtrl.setValue(null);
    }
  }

  public removeFilterCategory(category: string): void {
    const index = this.categories.indexOf(category);

    if (index >= 0) {
      this.categories.splice(index, 1);
    }
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    this.categories.push(event.option.viewValue);
    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCategories.filter(c => c.toLowerCase().indexOf(filterValue) === 0);
  }

  // END CATEGORY FILTER CHIP METHODS // 

  private setResourceSections() {
      this.resourceSections = [
        {title: "All", resources: this.resources, addName: "Resource"},
        {title: ResourceType[ResourceType.Readings], resources: this.resources.filter(r => r.resource_type_id === ResourceType.Readings), addName: "Reading"}, 
        {title: ResourceType[ResourceType.Videos], resources: this.resources.filter(r => r.resource_type_id === ResourceType.Videos), addName: "Video"},
        {title: ResourceType[ResourceType.Sample_Projects].split("_").join(" "), resources: this.resources.filter(r => r.resource_type_id === ResourceType.Sample_Projects), addName: "Sample Project"},
        {title: ResourceType[ResourceType.Other], resources: this.resources.filter(r => r.resource_type_id === ResourceType.Other), addName: "Other"}
      ];
      if (isNullOrUndefined(this.currentSection)) 
        this.currentSection = this.resourceSections[0].title;
      
  }

  public addResource(resourceType: string): void {
    let newResource: IResource = {
      id: 0, 
      name: null, 
      description: null, 
      url: null, 
      resource_type_id: ResourceType[resourceType],
      view_count: 0,
      is_featured: false, 
      is_approved: false
    }
    this.openAddDialog({title: resourceType, resource: newResource});
  }

  openAddDialog(dialogData: IAddResourceDialogData): void {
    const dialogRef = this.dialog.open(AddResourceDialog, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: IResource) => {
      if (result !== undefined) {
        this.getResources();
      }
    });
  }

  public displayFn(resource?: IResource): string | undefined {
    return resource ? resource.name : undefined;
  }

}