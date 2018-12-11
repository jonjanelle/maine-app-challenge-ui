import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResource } from '../interfaces/IResource';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from '../interfaces/IKeyValuePair';
import { isNullOrUndefined } from 'util';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly resourceUri: string;
  constructor(private http: HttpClient) { 
      this.resourceUri = 'http://localhost:3000/resources';  
  }

  public getResources(routeParams: IKeyValuePair<string, string>[] = null): Observable<IResource[]> {
    let endpoint = "";
    if (!isNullOrUndefined(routeParams) && routeParams.length > 0) 
      endpoint = this.addRouteParams(this.resourceUri, routeParams);
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
  
  private addRouteParams(baseUri: string, routeParams: IKeyValuePair<string, string>[]): string {
    baseUri = baseUri[baseUri.length - 1] === '/' ? baseUri.substring(0, baseUri.length-1) : baseUri; 
    return baseUri + '?' + routeParams.map(rp => `${rp.key}=${rp.value}`).join('&');    
  }
}
