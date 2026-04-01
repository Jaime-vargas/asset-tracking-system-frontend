import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class UtilityService{

  // BASE COLORS IN ONE PLACE
  baseColors = {
    blue: '#255498',
    gray: '#CCC',
    green: '#428d5b',
    red: '#c72e30',
    yellow: '#ec8a42',
  }

  // THIS APPLY JUST FOR LAST UPDATE AND CLOSED AT DATES
  isValidDate(date: string):string{
    if (date === "N/A"){
      return date
    }else return new Date(date).toLocaleDateString();
  }

  slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

}
