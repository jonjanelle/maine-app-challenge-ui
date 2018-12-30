import { Injectable, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { IKeyValuePair } from './interfaces/IKeyValuePair';
import { ICategory } from './interfaces/ICategory';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly baseUri: string = "https://maine-app-challenge-api.herokuapp.com/";
  private readonly categoryUri: string = "categories";
  private _categoryCache: Observable<ICategory[]>;
  private innerWidth: number;

  constructor(
    private http: HttpClient
  ) {  
  }

  public getBaseUri(): Observable<string> {
      return of(this.baseUri);
  }

  public buildUrl(uri: string, routeParams: IKeyValuePair<string, string>[]): string {
    uri = uri[uri.length - 1] === '/' ? uri.substring(0, uri.length-1) : uri; 
    return uri + '?' + routeParams.map(rp => `${rp.key}=${rp.value}`).join('&');    
  }


  public getCategories(): Observable<ICategory[]> {
    if (!this._categoryCache) {
      this._categoryCache = this.http.get<ICategory[]>(this.baseUri+this.categoryUri).pipe(
        shareReplay(1)
      );
    }
    return this._categoryCache;
  }

}
