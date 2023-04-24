import { Component, OnInit } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  public exchangeRate: number = 1.1;
  public amountEUR: number = 0;
  public amountUSD: number = 0;
  public fixedExchangeRate: number | null = null;
  public switchEURUSD: boolean = true; // true for EUR to USD, false for USD to EUR
  public exchangeRateSubscription: Subscription | undefined;

  ngOnInit(): void {
    // Update exchange rate every 3 seconds with a random value between -0.05 and +0.05
    this.exchangeRateSubscription = interval(3000)
      .subscribe(() => {
        const randomValue = Math.random() * 0.1 - 0.05;
        const newExchangeRate = this.exchangeRate + randomValue;
        if (this.fixedExchangeRate === null) {
          this.exchangeRate = newExchangeRate;
        } else {
          const diff = Math.abs(newExchangeRate - this.fixedExchangeRate) / this.exchangeRate;
          if (diff > 0.02) {
            this.fixedExchangeRate = null;
            this.exchangeRate = newExchangeRate;
          } else {
            this.exchangeRate = this.fixedExchangeRate;
          }
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the exchange rate update observable
    this.exchangeRateSubscription?.unsubscribe();
  }

  convertEURtoUSD(): void {
    this.amountUSD = this.amountEUR * this.exchangeRate;
  }

  convertUSDtoEUR(): void {
    this.amountEUR = this.amountUSD / this.exchangeRate;
  }

  onAmountEURChange(): void {
    if (this.switchEURUSD) {
      this.convertEURtoUSD();
    } else {
      this.convertUSDtoEUR();
    }
  }

  onAmountUSDChange(): void {
    if (this.switchEURUSD) {
      this.convertUSDtoEUR();
    } else {
      this.convertEURtoUSD();
    }
  }

  onExchangeRateChange(): void {
    if (this.fixedExchangeRate !== null) {
      this.exchangeRate = this.fixedExchangeRate;
      this.fixedExchangeRate = null;
    }
  }

}
