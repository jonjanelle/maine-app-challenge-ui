import {Component, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import {MatSort, MatTableDataSource, MatChipInputEvent, MatDialog,
        MatAutocompleteSelectedEvent, MatAutocomplete, Sort} from '@angular/material';
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
  
  // Search by name
  public resourceSearchEntry: string = "";

  // Category filter chip controls
  public visible = true;
  public selectable = true;
  public removable = true;
  public addOnBlur = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public categoryCtrl = new FormControl();
  public filteredCategories: Observable<string[]>;
  // All available category names
  public allCategories: string[];
  // Categories currently selected for filtering
  public categories: string[] = [];
  // Logical operator to use to join filtering categories
  public joinTypes: string[] = ['or', 'and', 'not'];
  public selectedJoinType: string = this.joinTypes[1];
  // resource id -> list of categories for that resource
  private resourceCategories: IKeyValuePair<number, string[]>[] = [];

  //sort fields for select menu on mobile, non-mobile uses table.
  public sortFields: IKeyValuePair<string, string>[] = [{key: "Name", value: "name"},
                                                        {key: "Description", value: "description"},
                                                        {key: "URL", value: "url"}];
  public sortDir: string = "asc";

  // Name of currently selected tab, corresponds to a ResourceType name and is used to look up ResourceType ids
  private currentSection: string;
  
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
 
  constructor(
    private resourceService: ResourceService, 
    public dialog: MatDialog,
    private appService: AppService
  ) { 
    this.getResources();
    this.isMobile = window.innerWidth <= 768;
    this.appService.getCategories().subscribe(resp => {
      this.allCategories = resp.map(c => c.name);
    });
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
      map((category: string | null) => {
        if (category) 
          return this._filter(category).filter(c => this.categories.indexOf(c) < 0);
        else
          return this.allCategories.filter(c => this.categories.indexOf(c) < 0).slice();
      })
    );
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
    this.resourceService.getResourceDescriptions().subscribe(rd => {
      this.resources = rd.map(r => r.resource);
      rd.forEach(r => this.resourceCategories.push({key: r.resource.id, value: r.categories.map(c => c.name)}));
      this.setResourceSections();
      this.refreshCurrentResourceSection()
      if (isNullOrUndefined(this.dataSources) || this.dataSources.length === 0) {
        this.dataSources = this.resourceSections.map(rs => new MatTableDataSource(rs.resources));
        this.dataSources.forEach(ds => ds.sort = this.sort);
      }
    }, (err) => {
      console.error("getResources(): ", err);
    }, () => {
      this.isBusy = false;
    });
  }

  // Sorting methods          //
  /////////////////////////////
  public sortResources(sort: Sort, resourceSectionIndex: number) {
    // console.log("sort", sort, "resourceSectionid", resourceSectionIndex);
    const data = this.resourceSections[resourceSectionIndex].resources.slice();
    if (!sort.active || sort.direction === '') {
      this.resources = data;
      return;
    }

    this.resourceSections[resourceSectionIndex].resources = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'description': return this.compare(a.description, b.description, isAsc);
        case 'url': return this.compare(a.url, b.url, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Category filter methods //
  /////////////////////////////

  // public addFilterCategory(event: MatChipInputEvent): void {
  //   // Add only when MatAutocomplete is not open
  //   // To make sure this does not conflict with OptionSelected Event
  //   if (!this.matAutocomplete.isOpen) {
  //     const input = event.input;
  //     const value = event.value;

  //     if (!isNullOrUndefined(value) && value.trim().length > 0) {
  //       let cat = this.allCategories.find(c => c.key === value);
  //       if (!isNullOrUndefined(cat) && !cat.value && this.categories.indexOf(value) < 0) {
  //         this.categories.push(value);
  //         // mark category as selected
  //         cat.value = true;
  //       }
  //     }

  //     // Reset the input value
  //     if (input) {
  //       input.value = '';
  //     }
  //     this.categoryCtrl.setValue(null);
  //   }
  // }

  public removeFilterCategory(category: string): void {
    const index = this.categories.indexOf(category);
    if (index >= 0) {
      this.categories.splice(index, 1);
    }
    this.categoryCtrl.setValue('');
    this.refreshCurrentResourceSection();
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    if (this.categories.indexOf(event.option.viewValue) < 0 &&
        this.allCategories.indexOf(event.option.viewValue) >= 0
    ) {
      this.categories.push(event.option.viewValue);
    }
    this.categoryInput.nativeElement.value = '';
    this.categoryCtrl.setValue(null);
    this.categoryInput.nativeElement.blur();

    
     this.refreshCurrentResourceSection();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allCategories.filter(c => c.toLowerCase().indexOf(filterValue) === 0);
  }

  // Initialization // 
  ///////////////////
  private refreshCurrentResourceSection(): void {
    let index = this.resourceSections.findIndex(rs => rs.title == this.currentSection);

    this.resourceSections[index].resources = this.resources.filter(r => {      
      let isCurrentType = this.resourceSections[index].title == 'All' || r.resource_type_id === ResourceType[this.resourceSections[index].title]
      
      let inSelectedCategory = true;
      if (this.categories.length > 0) {
        let resourceCategories = this.resourceCategories.find(rc => rc.key === r.id).value;
        if (this.selectedJoinType === 'and') {
          inSelectedCategory = resourceCategories.length > 0 && 
                               this.categories.map(c => resourceCategories.indexOf(c) >= 0).every(r => r);
        } else if (this.selectedJoinType === 'or') {
          inSelectedCategory = resourceCategories.filter(c => this.categories.indexOf(c) >= 0).length > 0;

        } else if (this.selectedJoinType === 'not') {
          inSelectedCategory = resourceCategories.filter(c => this.categories.indexOf(c) >= 0).length === 0;
        }
      }
      return isCurrentType && inSelectedCategory;
    });

  }

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