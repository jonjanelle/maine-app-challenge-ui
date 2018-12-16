import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResource } from '../interfaces/IResource';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from '../interfaces/IKeyValuePair';
import { isNullOrUndefined } from 'util';
import { AppService } from '../app.service';

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

  constructor(
      private http: HttpClient,
      private appService: AppService
    ) { 
      this.appService.getBaseUri().subscribe(baseUri => {
        this.resourceUri = baseUri + "resources";
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

  public updateResource(resource: IResource): void {

  }

  public deleteResource(resource: IResource): void {

  }
  
}