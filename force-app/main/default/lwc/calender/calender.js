/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 24-09-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track } from 'lwc';
import getAllDailyLogs from '@salesforce/apex/DailyTimeSheetController.getAllDailyLogs';

export default class Calender extends LightningElement {
    @track todayDate;
    @track currentYear;
    @track currentMonth;
    @track dispMonthDates = [];
    @track dailyLogs = [];
    totalHours=[1,2,3,4,5,6];

    CALENDER_GRID_LENGTH = 42;
    CURRUNET_MONTH_NAME = '';

    monthNameList = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    weekDaysList = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    connectedCallback() {

        this.todayDate = new Date();
        this.currentMonth = this.todayDate.getMonth(); // return months 0 - 11
        this.currentYear = this.todayDate.getFullYear();
        this.CURRUNET_MONTH_NAME = this.monthNameList[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentMonth + 1, this.currentYear);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays);   
    }

    setAllDailyLogs(year,totalNumberOfDays)
    {
        getAllDailyLogs({ year: parseInt(year) }) // geting data from DailyTimeSheetController
        .then(data => {
            this.dailyLogs = data;
            console.log('data : ', JSON.stringify(data));
        })
        .then(_ => {
            this.createDisplayMonthDates(totalNumberOfDays);
        })
        .catch(error => {
            console.log('error : ', JSON.stringify(error));
        });
    }

    numberOfDaysInAMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    createDisplayMonthDates(totalNumberOfDays) {

        const firstDayOfTheMonth = new Date(this.currentYear, this.currentMonth, 1);
        console.log('firstDayOfTheMonth:', firstDayOfTheMonth);
        const dayOne = firstDayOfTheMonth.getDay(); // Sunday is 0, Monday is 1, and so on.
        console.log('dayOne:', dayOne);
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth); // issue
        console.log('noOfDaysInPreviousMonth:', noOfDaysInPreviousMonth);
        let noOfDaysToAdd = dayOne;
        console.log('noOfDaysToAdd:', noOfDaysToAdd);
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--) {
            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth - 1, noOfDaysInPreviousMonth )),
                day: noOfDaysInPreviousMonth,
                isDisable: true,
            };
            noOfDaysInPreviousMonth--;
            previousMonthDaysArray.push(any);
        }
        console.log('previousMonthDaysArray:', previousMonthDaysArray);
        this.dispMonthDates = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++) {
            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth, i)), //'' + this.currentYear + '-' + this.currentMonth + '-' + i,
                day: i,
                isDisable: false,
            };
            this.dispMonthDates.push(any);
        }

        let len = this.dispMonthDates.length;

        for (let i = 1; i <= (this.CALENDER_GRID_LENGTH - len); i++) {
            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth + 1, i)),
                day: i,
                isDisable: false,
            };
            this.dispMonthDates.push(any);
        }


        this.dispMonthDates.map(any => {

            this.dailyLogs.forEach(ar => {

                if (any.date == ar.Date__c) {
                    any.Name = ar.Name;
                    any.Daily_Log = ar.Daily_Log__c;
                    any.Id = ar.Id;
                }
            });
        });

        console.log('this.dispMonthDates  Final2 ' + JSON.stringify(this.dispMonthDates));

    }

    formatedDate(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);

    }


    handleClickPrevious()
    {
        this.currentMonth--;// = this.todayDate.getMonth(); // return months 0 - 11
        console.log('handleClickPrevious currentMonth ', this.currentMonth);
        this.currentYear = this.todayDate.getFullYear();
        this.CURRUNET_MONTH_NAME = this.monthNameList[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentMonth + 1, this.currentYear);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays); 

    }


    handleClickNext()
    {
        this.currentMonth++;// = this.todayDate.getMonth(); // return months 0 - 11
        console.log('handleClickNext currentMonth ', this.currentMonth);
        this.currentYear = this.todayDate.getFullYear();
        this.CURRUNET_MONTH_NAME = this.monthNameList[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentMonth + 1, this.currentYear);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays); 
    }

    setToday()
    {
        // setting current setting
    }

    totalWorkingHrPerWeek()
    {
// calcukate total working 
    }

    //bilable and Non billable things
}
