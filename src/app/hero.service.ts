import { Injectable } from '@angular/core';
import { HEROES } from './mockheros';
import { Hero } from './hero';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'api/heroes';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  private log(message: string): void {
    this.messageService.add(`HeroService: ${message}`);
  }

  private handleError<T>(operation: string = 'operation', result?: T) {
    return (error: any) => {
      console.error(error);
      this.log(`${operation} failed ${error.message}`);
      return of(result as T);
    };
  }

  public getHeroes(): Observable<Hero[]> {
    this.messageService.add('HeroService: fetched Heroes');
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => {
        this.log('fetched heroes');
      }),
      catchError(this.handleError<Hero[]>('getHeroes', []))
    );
  }

  public getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => {
        this.log(`fetched hero id=${id}`);
      }),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  public updateHero(hero: Hero): Observable<void> {
    return this.http.put<void>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('upateHero'))
    );
  }

  public addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => {
        this.log(`added hero w/ id=${newHero.id}`);
      }),
      catchError(this.handleError<any>('addHero'))
    );
  }

  public deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleted'))
    );
  }

  public searchHeroes(term: string): Observable<Hero[]> {
    term = term.trim();
    if (!term) {
      return of([]);
    } else {
      const params = new HttpParams().set('name', term);
      return this.http.get<Hero[]>(`${this.heroesUrl}/`, { params }).pipe(
        tap(_ => this.log(`found heros matching "${term}"`)),
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
    }
  }
}
