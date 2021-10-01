/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 01-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track } from 'lwc';
import getAllDailyLogs from '@salesforce/apex/DailyTimeSheetController.getAllDailyLogs';
import TASK_FIELD from '@salesforce/schema/Log_Hour__c.Task__c';
import DATE_FIELD from '@salesforce/schema/Log_Hour__c.Date__c';
import DAILY_LOGS_FIELD from '@salesforce/schema/Log_Hour__c.Daily_Log__c';
import NOTES_FIELD from '@salesforce/schema/Log_Hour__c.Notes__c';
import PROJECT_FIELD from '@salesforce/schema/Log_Hour__c.Project__c';
import EMPLOYEE_FIELD from '@salesforce/schema/Log_Hour__c.Employee__c';

export default class Calender extends LightningElement {
    @track todayDate;
    @track dateTrack;
    @track currentYear;
    @track currentMonth;
    @track dispMonthDates = [];
    @track dailyLogs = [];
    @track totalHours = [];
    @track showModal = false;
    @track isEditFrom = false;
    @track isCreateFrom = false;
    @track recordId = '';
    @track selectedDate;

    CALENDER_GRID_LENGTH = 42;
    CURRUNET_MONTH_NAME = '';

    OBJECT_API_NAME = 'Log_Hour__c';

    fields = [TASK_FIELD, DATE_FIELD, DAILY_LOGS_FIELD, NOTES_FIELD, PROJECT_FIELD, EMPLOYEE_FIELD];

    MONTH_NAME_LIST = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    WEEK_DAYS_LIST = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    connectedCallback() {

        this.todayDate = new Date();
        this.dateTrack = this.todayDate;
        this.setDateandCalDetails();
    }

    async setAllDailyLogs(year, totalNumberOfDays) {
        await getAllDailyLogs({ year: parseInt(year) }) // geting data from DailyTimeSheetController
            .then(data => {
                this.dailyLogs = data;
                console.log('this.dailyLogs:', this.dailyLogs);
            })
            .then(async _ => {
                this.createDisplayMonthDates(totalNumberOfDays);
            }).then(_temp => {
                this.totalWorkingHrPerWeek();
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
        const dayOne = firstDayOfTheMonth.getDay(); // Sunday is 0, Monday is 1, and so on.
        let noOfDaysInPreviousMonth = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth);
        let noOfDaysToAdd = dayOne;
        let previousMonthDaysArray = [];

        for (let i = noOfDaysToAdd; i > 0; i--) {
            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth - 1, noOfDaysInPreviousMonth)),
                day: noOfDaysInPreviousMonth,
                isDisable: true,
                Daily_Log: 0,

            };
            noOfDaysInPreviousMonth--;
            previousMonthDaysArray.push(any);
        }
        this.dispMonthDates = [...previousMonthDaysArray.reverse()];

        for (let i = 1; i <= totalNumberOfDays; i++) {

            let any =
            {
                date: this.formatedDate(new Date(this.currentYear, this.currentMonth, i)), //'' + this.currentYear + '-' + this.currentMonth + '-' + i,
                day: i,
                isDisable: false,
                Daily_Log: 0,

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
                Daily_Log: 0,

            };
            this.dispMonthDates.push(any);
        }

        this.dispMonthDates.map(date1 => {

            this.dailyLogs.forEach(date2 => {
                if (date1.date === date2.Date__c) {
                    date1.Id = date2.Id;
                    date1.Notes = date2.Notes__c;
                    date1.Name = date2.Name;
                    date1.Task = date2.Task__c;
                    date1.Daily_Log = date2.Daily_Log__c ? parseInt(date2.Daily_Log__c) : 0;
                    date1.Project = date2.Project__c;
                    date1.Employee = date2.Employee__c;

                }
            })

        });

        console.log('this.dispMonthDates:', JSON.stringify(this.dispMonthDates));
    }

    formatedDate(date) {
        var d = date.getDate();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);

    }

    handleClickPrevious() {
        this.dateTrack = new Date(this.currentYear, this.currentMonth - 1, 1);
        this.setDateandCalDetails();
    }

    handleClickNext() {
        this.dateTrack = new Date(this.currentYear, this.currentMonth + 1, 1);
        this.setDateandCalDetails();
    }

    isToday(date) {
        return date == this.formatedDate(this.todayDate) ? true : false;
    }

    totalWorkingHrPerWeek() {
        try {
            var count = 0;
            var tmepArry = [];
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
        }
        catch (error) {
            console.log('error @ totalWorkingHrPerWeek ', error);

        }
    }

    setDateandCalDetails() {
        this.currentMonth = this.dateTrack.getMonth();
        this.currentYear = this.dateTrack.getFullYear();
        this.CURRUNET_MONTH_NAME = this.MONTH_NAME_LIST[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth + 1);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays);
        console.log('this.currentYear:', this.currentYear);
    }

    onClickOfDate(event) {
        var onClickedDate = event.currentTarget.id.slice(0, 10);
        console.log('onClickedDate', onClickedDate);
        let objectData = this.checkDateIsAvailable(onClickedDate);
        console.log('objectData:', objectData);
        if (objectData) {
            this.setEditForm();
        } else {
            this.selectedDate = onClickedDate;
            this.setCreateForm();
        }
        this.openModal();
    }

    checkDateIsAvailable(onClickedDate) {
        this.dailyLogs.forEach(key => {
            if (key.Date__c == onClickedDate) {
                this.recordID = key.Id;
            }
        });

        if (this.recordID) {
            return this.recordID;
        } else {
            return false;
        }
    }

    setEditForm() {
        this.isEditFrom = true;
        this.isCreateFrom = false;
    }

    setCreateForm() {
        this.isEditFrom = false;
        this.isCreateFrom = true;
    }

    openModal() {
        console.log('opening the model now');
        this.showModal = true;
    }

    closeModal() {
        console.log('closing the model now');
        this.showModal = false;
    }

    handleCancel() {
        console.log('handling cancel now');
        closeModel();
    }

    handleSubmit() {
        console.log('submitted:');
        closeModel();
    }

    editSuccess() {
        console.log('editSuccess:');
        closeModel();
    }
}


// tost and error handling lib
