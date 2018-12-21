import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';
import { MatDialog } from '@angular/material';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, debounceTime, switchMap} from 'rxjs/operators';

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

  private currentSection: string;
  
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public resourceService: ResourceService, 
    public dialog: MatDialog,
    private appService: AppService
  ) { 
    this.getResources();
    this.resourceSearchCtrl = new FormControl();
    this.isMobile = this.appService.isMobile();
  }

  ngOnInit() {
    this.filteredResources = this.resourceSearchCtrl.valueChanges
      .pipe(
        debounceTime(200),
        switchMap((name:string) => this.searchByName(name))
    );

    this.filteredResources.subscribe(fr => {
      this.resourceSections.find(rs => rs.title == this.currentSection).resources = fr;
    });
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