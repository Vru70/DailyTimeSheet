/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 23-09-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track, wire } from 'lwc';
import getAllDailyLogs from '@salesforce/apex/DailyTimeSheetController.getAllDailyLogs';

export default class Calender extends LightningElement {
    @track date;
    @track crYear;
    @track crMonth;

    @track dateArray = [];

    @track year = '2021';

    logsData = []; // data from backend 

    monthNameList = ["", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    weekdaysList = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    connectedCallback() {
        this.date = new Date(); // return current date
        this.crMonth = this.date.getMonth() + 1;
        this.crYear = this.date.getFullYear();
        console.log('crMonth : ', this.crMonth, ' this.crYear ', this.crYear);
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.date.getMonth() + 1, this.date.getFullYear());
        console.log('totalNumberOfDays:', totalNumberOfDays);
        this.creatDateArray(totalNumberOfDays);
    }

    numberOfDaysInAMonth(month, year) {
        return new Date(year, month, 0).getDate();
    }


    creatDateArray(totalNumberOfDays) {
        console.log('START creatDateArray :');
        const firstDayOfTheMonth = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
        console.log('firstDayOfTheMonth ' + firstDayOfTheMonth);
        const dayOne = firstDayOfTheMonth.getDay(); // Sunday is 0, Monday is 1, and so on.
        console.log('dayOne ' + dayOne);
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.date.getMonth(), this.date.getFullYear()); // issue
        console.log('noOfDaysInPreviousMonth ' + noOfDaysInPreviousMonth);
        let noOfDaysToAdd;// = 7 - (dayOne + 1);
        if (dayOne == 0) {
            noOfDaysToAdd = 0;
        } else {
            //noOfDaysToAdd = 7 - (dayOne + 1);
            noOfDaysToAdd = dayOne;
        }
        console.log('noOfDaysToAdd: ', noOfDaysToAdd);
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--) {
            let any =
            {
                date: '',
                day: noOfDaysInPreviousMonth--,
                isDisable: true,
            };
            previousMonthDaysArray.push(any);
        }
        console.log('previousMonthDaysArray ', previousMonthDaysArray);
        this.dateArray = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++) {
            let any =
            {
                date:this.formatedDate(new Date(this.crYear,this.crMonth -1 ,i)), //'' + this.crYear + '-' + this.crMonth + '-' + i,
                day: i,
                isDisable: false,
            };
            this.dateArray.push(any);
        }
        console.log('this.dateArray   ', this.dateArray);

        let len = this.dateArray.length;
        console.log(' len ', len);
        for (let i = 1; i <= (42 - len); i++) {
            let any =
            {
                date: '',
                day: i,
                isDisable: false,
            };
            this.dateArray.push(any);
        }
        console.log('this.dateArray  Final ' + JSON.stringify(this.dateArray));
    }


    @wire(getAllDailyLogs, { year: '$year' })
    DailyLogs({ error, data }) {
        if (data) {
            this.logsData = data;
            console.log('data : ', JSON.stringify(data));
        } else if (error) {
            console.log('error : ', JSON.stringify(error));
        }
    }

    formatedDate(date) 
    {
            var d = date.getDate();
            var m = date.getMonth() + 1;
            var y = date.getFullYear();
            return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
        
    }

}
