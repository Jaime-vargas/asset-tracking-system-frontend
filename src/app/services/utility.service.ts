import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class UtilityService{

  // BASE COLORS IN ONE PLACE
  baseColors = {
    blue: '#255498',
    gray: '#CCC',
    green: '#01ba01',
    red: '#e75557',
    yellow: '#febf48',
  }

  // THIS APPLY JUST FOR LAST UPDATE AND CLOSED AT DATES
  isValidDate(date: string):string{
    if (date === "N/A"){
      return date
    }else return new Date(date).toDateString();
  }

  validLongDate(date: string):string{
    if (date === "N/A"){
      return date
    }else return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
  }

  slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

}
