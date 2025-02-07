import { Injectable } from '@angular/core';
import {
  Country,
  Region,
  SmallCountry,
} from '../interfaces/countries.interface';
import { HttpClient } from '@angular/common/http';
import { combineLatest, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  private baseUrl = 'https://restcountries.com/v3.1';

  constructor(private httpClient: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if(!region) return of([]);

    const result: Observable<SmallCountry[]> = this.httpClient
      .get<Country[]>(
        `${this.baseUrl}/region/${region}?fields=name,cca3,borders`
      )
      .pipe(
        map((countries) =>
          countries.map((country) => ({
            name: country.name.common,
            cca3: country.cca3,
            borders: country.borders ?? [],
          }))
        ),
        tap((result) => console.log({ result }))
      );
    return result;
  }

  getCountryByAlphaCode(cca3: string): Observable<SmallCountry> {
    if (!cca3) return of({} as SmallCountry);

    return this.httpClient
      .get<Country>(`${this.baseUrl}/alpha/${cca3}?fields=name,cca3,borders`)
      .pipe(
        map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      );
  }

  getCountriesBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders) return of([]);

    const countriesRequests: Observable<SmallCountry>[] = [];
    borders.forEach((border) => {
      const request = this.getCountryByAlphaCode(border);
      countriesRequests.push(request);
    });

    return combineLatest(countriesRequests);
  }
}
