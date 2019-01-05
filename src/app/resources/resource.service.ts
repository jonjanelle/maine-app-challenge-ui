import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResource } from '../interfaces/IResource';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from '../interfaces/IKeyValuePair';
import { isNullOrUndefined } from 'util';
import { AppService } from '../app.service';
import { IResourceDescription } from '../interfaces/IResourceDescription';
import { IResourceCategory } from '../interfaces/IResourceCategory';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private resourceUri: string;
  private resourceDescriptionUri: string;
  private resourceCategoryUri: string;

  constructor(
      private http: HttpClient,
      private appService: AppService
    ) { 
      this.appService.getBaseUri().subscribe(baseUri => {
        this.resourceUri = baseUri + "resources";
        this.resourceDescriptionUri = baseUri + "resource_descriptions";
        this.resourceCategoryUri = baseUri + "resource_categories";
      });
    }

  public getResources(routeParams: IKeyValuePair<string, string>[] = null): Observable<IResource[]> {
    let endpoint = "";
    if (!isNullOrUndefined(routeParams) && routeParams.length > 0) 
      endpoint = this.appService.buildUrl(this.resourceUri, routeParams);
    else 
      endpoint = this.resourceUri;
    
    return this.http.get<IResource[]>(endpoint);
  }


  public createResource(resource: IResource): Observable<IResource> {
    return this.http.post<IResource>(this.resourceUri, {resource: resource}, httpOptions);
  }


  public getResourceDescriptions(routeParams: IKeyValuePair<string, string>[] = null): Observable<IResourceDescription[]> {
    let endpoint = "";
    if (!isNullOrUndefined(routeParams) && routeParams.length > 0) 
      endpoint = this.appService.buildUrl(this.resourceDescriptionUri, routeParams);
    else 
      endpoint = this.resourceDescriptionUri;
    
    return this.http.get<IResourceDescription[]>(endpoint);
  } 

  public createResourceCategory(resourceCategory: IResourceCategory): Observable<IResourceCategory> {
    return this.http.post<IResourceCategory>(this.resourceCategoryUri, {resource_category: resourceCategory}, httpOptions);

  }
  
}