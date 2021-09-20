/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 20-09-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   20-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement } from 'lwc';


export default class Calender extends LightningElement {
    date = new Date();
    dateArray = [];

    /**
     * @param {Number} month month for which total no. of days in it will be returned.
     * @param {Number} year in the formate YYYY.
     */
    numberOfDaysInAMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * @description creates a number arrays with all the dates in a month starting from 1 till the last day
     * @param {Number} totalNumberOfDays 
     */
    creatDateArray(totalNumberOfDays) {
        console.log('START creatDateArray :');
        const firstDayOfTheMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
        const dayOne = firstDayOfTheMonth.getDay();
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.date.getMonth(), this.date.getFullYear());
        let noOfDaysToAdd = 7 - (dayOne + 1);
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--) {
            previousMonthDaysArray.push(noOfDaysInPreviousMonth--);
        }

        this.dateArray = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++) {
            this.dateArray.push(i);
        }

        let firstDayOfNextMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);

        for (let i = 1; i <= (7 - firstDayOfNextMonth.getDay()); i++) {
            this.dateArray.push(i)
        }
        console.log('firstDayOfTheMonth ' + firstDayOfTheMonth);
        console.log('dayOne' + dayOne);
        console.log('noOfDaysInPreviousMonth' + noOfDaysInPreviousMonth);
        console.log('previousMonthDaysArray' + previousMonthDaysArray);
        console.log('this.dateArray   ' + this.dateArray);
    }

    /**
     * @description Creates the HTML calender dynamically
     */
    setCalendar() {
        console.log('START setCalendar :');
        let element = this.template.querySelector('[data-id="monthid"]');
        console.log('element :', element);
        if (element) {
            element.innerHTML = this.createDays();
        }

    }

    createDays() {
        console.log('START createDays :');
        let dateHTMLText = '';
        this.dateArray.forEach(day => {
            let dayItem = '<span class="day-item"> ' + day + ' </span>'
            dateHTMLText += '<div class="each-day">' + dayItem + '</div>'
        });
        console.log('dateHTMLText:', dateHTMLText);
        return dateHTMLText;
    }

    // connectedCallback() {
    //     console.log('START connectedCallback :');
    //     let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth() + 1, this.date.getFullYear());
    //     console.log('totalNumberOfDays:', totalNumberOfDays);
    //     this.creatDateArray(totalNumberOfDays);
    //     this.setCalendar();
    // }
    renderedCallback() {
        console.log('START connectedCallback :');
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth() + 1, this.date.getFullYear());
        console.log('totalNumberOfDays:', totalNumberOfDays);
        this.creatDateArray(totalNumberOfDays);
        this.setCalendar();

    }

}
