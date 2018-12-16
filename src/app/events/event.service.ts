import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEvent } from '../interfaces/IEvent';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from '../interfaces/IKeyValuePair';
import { isNullOrUndefined } from 'util';
import { AppService } from '../app.service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type':  'application/json'})
};

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private eventUri: string;
  constructor(
    private http: HttpClient,
    private appService: AppService
  ) { 
    this.appService.getBaseUri().subscribe(baseUri => {
      this.eventUri = baseUri + 'events';  
    })
  }

  public getEvents(routeParams: IKeyValuePair<string, string>[] = null): Observable<IEvent[]> {
    let endpoint = "";
    if (!isNullOrUndefined(routeParams) && routeParams.length > 0) {

      endpoint = this.addRouteParams(this.eventUri, routeParams);
      console.log("endpoint: ", endpoint, " routePArams: ", routeParams);
    }
    else 
      endpoint = this.eventUri;
    
    return this.http.get<IEvent[]>(endpoint);
  }


  public createEvent(event: IEvent): Observable<IEvent> {
    return this.http.post<IEvent>(this.eventUri, {event: event}, httpOptions);
  }

  public updateEvent(event: IEvent): void {

  }

  public deleteEvent(event: IEvent): void {

  }
  
  private addRouteParams(baseUri: string, routeParams: IKeyValuePair<string, string>[]): string {
    baseUri = baseUri[baseUri.length - 1] === '/' ? baseUri.substring(0, baseUri.length-1) : baseUri; 
    return baseUri + '?' + routeParams.map(rp => `${rp.key}=${rp.value}`).join('&');    
  }
}
