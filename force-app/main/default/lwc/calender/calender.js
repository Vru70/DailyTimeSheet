/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 22-09-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track, wire } from 'lwc';

export default class Calender extends LightningElement 
{
    date = new Date();
    dateArray = [];

    @track currMonth;
    @track currYear;
    @track monthNAme = '';

    monthNames = [  "", "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

    weekdays = ["Mon","Tues","Wed","Thu","Fri","Sat","Sun"];

    connectedCallback()
    {
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth() + 1, this.date.getFullYear());
        console.log('totalNumberOfDays:', totalNumberOfDays);
        this.creatDateArray(totalNumberOfDays);
        this.currMonth = this.date.getMonth() + 1;
        this.currYear = this.date.getFullYear();
        this.getMonthName();
        console.log('currYear:', this.currYear);
    }


    /**
     * @param {Number} month month for which total no. of days in it will be returned.
     * @param {Number} year in the formate YYYY.
     */
    numberOfDaysInAMonth(month, year)
    {
        return new Date(year, month, 0).getDate();
    }

    /**
     * @description creates a number arrays with all the dates in a month starting from 1 till the last day
     * @param {Number} totalNumberOfDays 
     */
    creatDateArray(totalNumberOfDays)
    {
        console.log('START creatDateArray :');
        const firstDayOfTheMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
        const dayOne = firstDayOfTheMonth.getDay(); // Sunday is 0, Monday is 1, and so on.
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.date.getMonth(), this.date.getFullYear());
        let noOfDaysToAdd = 7 - (dayOne + 1);
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--)
        {
            previousMonthDaysArray.push(noOfDaysInPreviousMonth--);
        }

        this.dateArray = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++)
        {
            this.dateArray.push(i);
        }

        let firstDayOfNextMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1);

        for (let i = 1; i <= (7 - firstDayOfNextMonth.getDay()); i++)
        {
            this.dateArray.push(i)
        }
        console.log('firstDayOfTheMonth ' + firstDayOfTheMonth);
        console.log('dayOne ' + dayOne);
        console.log('noOfDaysInPreviousMonth ' + noOfDaysInPreviousMonth);
        console.log('previousMonthDaysArray ' + previousMonthDaysArray);
        console.log('this.dateArray   ' + this.dateArray);
    }

    handleClickNext()
    {
        console.log('handleClickNext:');
        this.currMonth++;
        this.date = new Date(this.date.setMonth(this.date.getMonth()+1));
        console.log('new month ++  ', this.date);
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth(), this.date.getFullYear());
        console.log('totalNumberOfDays:', totalNumberOfDays);
        this.creatDateArray(totalNumberOfDays);
        this.getMonthName();
    }

    handleClickPre()
    {
        console.log('handleClickPre:');
        this.currMonth--;
        this.date = new Date(this.date.setMonth(this.date.getMonth()-1));
        console.log('new month --  ', this.date);
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth(), this.date.getFullYear());
        console.log('totalNumberOfDays:', totalNumberOfDays);
        this.creatDateArray(totalNumberOfDays);
        this.getMonthName();
    }
    
    getMonthName()
    {
        this.monthNAme = this.monthNames[this.currMonth];
        console.log('this.monthNAme:', this.monthNAme);
    }

}
