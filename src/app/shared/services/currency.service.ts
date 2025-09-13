import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currencyMap: { [key: string]: { symbol: string; code: string } } = {
    'US': { symbol: '$', code: 'USD' },
    'GB': { symbol: '£', code: 'GBP' },
    'EU': { symbol: '€', code: 'EUR' },
    'JP': { symbol: '¥', code: 'JPY' },
    'IN': { symbol: '₹', code: 'INR' },
    'CA': { symbol: 'C$', code: 'CAD' },
    'AU': { symbol: 'A$', code: 'AUD' },
    'CN': { symbol: '¥', code: 'CNY' },
    'KR': { symbol: '₩', code: 'KRW' },
    'BR': { symbol: 'R$', code: 'BRL' },
    'MX': { symbol: '$', code: 'MXN' },
    'RU': { symbol: '₽', code: 'RUB' },
    'ZA': { symbol: 'R', code: 'ZAR' },
    'SG': { symbol: 'S$', code: 'SGD' },
    'CH': { symbol: 'CHF', code: 'CHF' }
  };

  getCurrentCurrency(): { symbol: string; code: string } {
    // For testing - you can manually set country here
    const manualCountry = 'IN'; // Change this to test different countries
    const userCountry = manualCountry || this.getUserCountry();
    
    console.log('Using country:', userCountry);
    const currency = this.currencyMap[userCountry] || { symbol: '$', code: 'USD' };
    console.log('Currency:', currency);
    
    return currency;
  }

  private getUserCountry(): string {
    // Try to get country from browser locale
    const locale = navigator.language || 'en-US';
    console.log('Browser locale:', locale);
    
    // Handle different locale formats
    let countryCode = 'US';
    if (locale.includes('-')) {
      countryCode = locale.split('-')[1];
    } else if (locale.includes('_')) {
      countryCode = locale.split('_')[1];
    } else {
      // Map language codes to likely countries
      const languageMap: { [key: string]: string } = {
        'hi': 'IN', // Hindi -> India
        'ja': 'JP', // Japanese -> Japan
        'ko': 'KR', // Korean -> Korea
        'zh': 'CN', // Chinese -> China
        'ru': 'RU', // Russian -> Russia
        'pt': 'BR', // Portuguese -> Brazil
        'es': 'MX'  // Spanish -> Mexico
      };
      countryCode = languageMap[locale] || 'US';
    }
    
    const result = countryCode.toUpperCase();
    console.log('Detected country:', result);
    return result;
  }

  formatAmount(amount: number): string {
    const currency = this.getCurrentCurrency();
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}