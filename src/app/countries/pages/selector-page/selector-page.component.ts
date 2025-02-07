import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/countries.interface';
import { filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  standalone: false,

  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {
  private formBuilder: FormBuilder = inject(FormBuilder);
  private countriesService: CountriesService = inject(CountriesService);
  private subject$ = new Subject<void>();

  public myForm = this.formBuilder.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    borders: ['', [Validators.required]],
  });

  public countriesByRegion: SmallCountry[] = [];
  public bordersByCountry: SmallCountry[] = [];

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChangedClass();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }
  //Metodo realizado por el profesor Fernando donde usa una peticion HTTP extra para obtener los paises por region, takeUntil fue agregado por mi cuenta y el reset en subscribe, el profesor lo realizar en pipe con tap.
  onRegionChange(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        filter((region: string | null): region is string => !!region && region.length > 0),
        switchMap((region: string)=>
          this.countriesService.getCountriesByRegion(region as Region)
        ),
        takeUntil(this.subject$)
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
        this.myForm.get('country')!.reset('');
        this.bordersByCountry = [];
      });
  }
  // Metodo realizado por el profesor Fernando donde usa una peticion HTTP extra para obtener las fronteras de un pais mediante la solicutud de la informacion de un pais por su cca3
  onCountryChangedClass(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('borders')!.setValue('')),
        filter((cca3: string | null): cca3 is string => !!cca3 && cca3.length > 0),
        switchMap((cca3: string) => this.countriesService.getCountryByAlphaCode(cca3)),
        switchMap((country: SmallCountry) => this.countriesService.getCountriesBordersByCodes(country.borders)),
        takeUntil(this.subject$)
      )
      .subscribe((countries) => {
        console.log({ borders: countries });
        this.bordersByCountry = countries;
      });
  }

  //Mi metodo, que no realiza una peticion HTTP extra, sino usa la informacion ya obtenida en countriesByRegion de la primera peticion.
  // onCountryChanged(): void {
  //   this.myForm
  //     .get('country')!
  //     .valueChanges.pipe(
  //       filter((cca3: string | null | undefined) => !!cca3 && cca3.length > 0),
  //       map((cca3) => this.findCountryByCca3(cca3!)),
  //       takeUntil(this.subject$)
  //     )
  //     .subscribe((country) => {
  //       this.myForm.get('borders')!.setValue('');
  //       console.log({ borders: country.borders });
  //       this.bordersByCountry = country.borders;
  //     });
  // }

  // Metodos de orden para los arreglos de paises y fronteras y usarlos mediante el pipe personalizado customSort
  sortCountry(a: SmallCountry, b: SmallCountry): number {
    return a.name > b.name ? 1 : -1;
  }

  sortBorders(a: string, b: string): number {
    return a > b ? 1 : -1;
  }

  //Metodo para encontrar el pais por su cca3 en la informacion ya obtenida en la primera peticion HTTP de paises por region se usa en el metodo onCountryChanged propio
  findCountryByCca3(cca3: string): SmallCountry {
    const result = {
      name: '',
      cca3: '',
      borders: [],
    };
    if (!cca3) {
      return { ...result };
    }
    return this.countriesByRegion.find((country) => country.cca3 === cca3)!;
  }

  ngOnDestroy(): void {
    this.subject$.next();
    this.subject$.complete();
  }
}
