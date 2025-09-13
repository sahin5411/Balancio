import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  show() {
    console.log('LoaderService: Showing loader');
    this.loadingSubject.next(true);
  }

  hide() {
    console.log('LoaderService: Hiding loader');
    this.loadingSubject.next(false);
  }
}
