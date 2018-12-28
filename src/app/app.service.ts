import { Injectable, HostListener } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from './interfaces/IKeyValuePair';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly baseUri: string = "https://maine-app-challenge-api.herokuapp.com/";
  private innerWidth: number;

  constructor() {  
  }

  public getBaseUri(): Observable<string> {
      return of(this.baseUri);
  }

  public buildUrl(baseUri: string, routeParams: IKeyValuePair<string, string>[]): string {
    baseUri = baseUri[baseUri.length - 1] === '/' ? baseUri.substring(0, baseUri.length-1) : baseUri; 
    return baseUri + '?' + routeParams.map(rp => `${rp.key}=${rp.value}`).join('&');    
  }

}
