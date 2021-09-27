/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 27-09-2021
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
    @track totalHours = [];

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

    async setAllDailyLogs(year, totalNumberOfDays) {
        await getAllDailyLogs({ year: parseInt(year) }) // geting data from DailyTimeSheetController
            .then(data => {
                this.dailyLogs = data;
                console.log('data : ', JSON.stringify(data));
            })
            .then(async _ => {
                this.createDisplayMonthDates(totalNumberOfDays);
            }).then(_temp => {
                this.totalWorkingHrPerWeek();
                console.log('totalHours:', this.totalHours);
            })
            .catch(error => {
                console.log('error @ setAllDailyLogs : ', JSON.stringify(error));
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
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth - 1, noOfDaysInPreviousMonth)),
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


        this.dispMonthDates.map(date1 => {

            this.dailyLogs.forEach(date2 => {

                if (date1.date == date2.Date__c) {
                    date1.Daily_Log = date2.Daily_Log__c ? parseInt(date2.Daily_Log__c) : 0;
                    date1.isToday = this.isToday(date1.date);
                } else {
                    date1.Daily_Log = 0;
                    date1.isToday = this.isToday(date1.date);
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

    handleClickPrevious() {
        this.currentMonth--;// = this.todayDate.getMonth(); // return months 0 - 11
        console.log('handleClickPrevious currentMonth ', this.currentMonth);
        this.currentYear = this.todayDate.getFullYear();
        this.CURRUNET_MONTH_NAME = this.monthNameList[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentMonth + 1, this.currentYear);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays);

    }

    handleClickNext() {
        this.currentMonth++;// = this.todayDate.getMonth(); // return months 0 - 11
        console.log('handleClickNext currentMonth ', this.currentMonth);
        this.currentYear = this.todayDate.getFullYear();
        this.CURRUNET_MONTH_NAME = this.monthNameList[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentMonth + 1, this.currentYear);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays);
    }

    isToday(date) {
        if (date == this.formatedDate(this.todayDate)) {
            return true;
        } else {
            return false;
        }
    }

    totalWorkingHrPerWeek() {
        try {
            var count = 0;
            var tmepArry = [];
            // calcukate total working 
            for (let i = 0; i < 6; i++) {
                var temp = 0;
                for (let j = 0; j < 7; j++) {
                    if (this.dispMonthDates[count].Daily_Log) {
                        temp = temp + this.dispMonthDates[count].Daily_Log;
                    }
                    count++;
                }
                tmepArry[i] = temp;    
            }
            this.totalHours = tmepArry;
            console.log('tmepArry ', tmepArry);
            console.log('this.totalHours ', this.totalHours);
        }
        catch (error) {
            console.log('error @ totalWorkingHrPerWeek ', error);

        }
    }

}
