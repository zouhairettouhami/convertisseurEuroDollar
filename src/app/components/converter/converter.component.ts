import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { interval, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

interface Conversion {
  date: Date;
  amount: number;
  from: string;
  rate: number;
  result: number;
  to: string;
}

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit {
  exchangeRate = new BehaviorSubject<number>(1.1);
  amountInput = new FormControl('');
  fixedRateInput = new FormControl('');
  isEurToUsd = true;
  fixedRateUsed = false;
  exchangeRateTrend: 'up' | 'down' | 'none' = 'none';
  conversions: Conversion[] = [];


  convertedAmount$ = combineLatest([
    this.amountInput.valueChanges.pipe(
      startWith(this.amountInput.value),
      debounceTime(500)),
    this.exchangeRate,
  ]).pipe(
    map(([amount, rate]) => this.convertAmount(amount, rate))
  );

  ngOnInit() {
    interval(3000).subscribe(() => {
      const randomChange = Math.random() * 0.1 - 0.05;
      const newRate = this.exchangeRate.value + randomChange;
      if (newRate > this.exchangeRate.value) {
        this.exchangeRateTrend = 'up';
      } else if (newRate < this.exchangeRate.value) {
        this.exchangeRateTrend = 'down';
      } else {
        this.exchangeRateTrend = 'none';
      }
      this.exchangeRate.next(newRate);
    });
  }

  toggleCurrency() {
    this.isEurToUsd = !this.isEurToUsd;
    this.amountInput.setValue(this.amountInput.value);
  }

  convertAmount(amount: number, rate: number): number {
    const fixedRate = parseFloat(this.fixedRateInput.value);

    let result;
    if (fixedRate && Math.abs((fixedRate - rate) / rate) <= 0.02) {
      this.fixedRateUsed = true;
      result = this.isEurToUsd ? amount * fixedRate : amount / fixedRate;
    } else {
      this.fixedRateUsed = false;
      result = this.isEurToUsd ? amount * rate : amount / rate;
    }

    if(typeof amount !== 'string') {
      const conversion: Conversion = {
        date: new Date(),
        amount,
        from: this.isEurToUsd ? 'EUR' : 'USD',
        rate,
        result,
        to: this.isEurToUsd ? 'USD' : 'EUR'
      };

      this.conversions.unshift(conversion);
      this.conversions = this.conversions.slice(0, 5);
    }

    return parseFloat(result.toFixed(2));
  }
}

