import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { ICat } from '../interfaces/ICat';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class CatService {
  private readonly catUri: string;

  constructor(private http: HttpClient) { 
      this.catUri = 'https://api.thecatapi.com/v1/images/search?';
    
  }

  public getCat(): Observable<ICat[]> {
    return this.http.get<ICat[]>(this.catUri);
  }
  
}