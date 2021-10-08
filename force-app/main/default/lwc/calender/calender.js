/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 07-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   21-09-2021   Vrushabh Uprikar   Initial Version
**/
import { LightningElement, track } from 'lwc';
import getAllDailyLogs from '@salesforce/apex/DailyTimeSheetController.getAllDailyLogs';
import getTaskListByDay from '@salesforce/apex/DailyTimeSheetController.getTaskListByDay';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { reduceErrors } from 'c/ldsUtils';


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
    @track recordID = '';
    @track selectedDate;
    error;

    @track allData = []; // Task Data 
    allDataOrgCopy = []; // DatatableOrignalCpy

    CALENDER_GRID_LENGTH = 42;
    CURRUNET_MONTH_NAME = '';

    OBJECT_API_NAME = 'Log_Hour__c';

    MONTH_NAME_LIST = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    WEEK_DAYS_LIST = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

    
    columns = [
        { label: 'Task', fieldName: 'Name' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
    ];


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
                this.error =  reduceErrors(error);
                console.log('Error @ getAllDailyLogs:', this.error);
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
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,

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
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,

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
                Daily_Log_Hr: 0,
                Daily_Log_Min: 0,

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
                    date1.Daily_Log_Hr = date2.Daily_Log_Hour__c  ? date2.Daily_Log_Hour__c  : 0;
                    date1.Daily_Log_Min = date2.Daily_Log_Mins__c  ? date2.Daily_Log_Mins__c : 0;
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
            var tempArry = [];
            for (let i = 0; i < 6; i++)
            {
                var hour = 0;
                var mins = 0
                for (let j = 0; j < 7; j++)
                {
                    if (this.dispMonthDates[count].Daily_Log_Hr || this.dispMonthDates[count].Daily_Log_Min)
                    { 
                        hour = hour + parseInt(this.dispMonthDates[count].Daily_Log_Hr);
                        mins = mins + parseInt(this.dispMonthDates[count].Daily_Log_Min);
                    }
                    count++;
                }

                tempArry[i] = this.timeConvert((hour*60)+mins);
            }
            this.totalHours = tempArry;
            console.log('this.totalHours:'+ JSON.stringify(this.totalHours));
        }
        catch (error)
        {
            this.error =  reduceErrors(error);
            console.log('Error @ totalWorkingHrPerWeek:', this.error);
        }
    }

    timeConvert(n)
    {
        var num = n;
        var hours = (num / 60);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        return (rhours<10?"0":"")+rhours + ":"+(rminutes<10?"0":"") + rminutes;
    }

    setDateandCalDetails() {
        this.currentMonth = this.dateTrack.getMonth();
        this.currentYear = this.dateTrack.getFullYear();
        this.CURRUNET_MONTH_NAME = this.MONTH_NAME_LIST[this.currentMonth];
        let totalNumberOfDays = this.numberOfDaysInAMonth(this.currentYear, this.currentMonth + 1);
        this.setAllDailyLogs(this.currentYear, totalNumberOfDays);
        console.log('this.currentYear:', this.currentYear);
    }

    async onClickOfDate(event) {
        var onClickedDate = event.currentTarget.id.slice(0, 10);
        console.log('onClickedDate', onClickedDate);

        await getTaskListByDay({ strDate: onClickedDate })
            .then(data => {

                this.allData = data;
                console.log('this.allData:'+JSON.stringify(this.allData));
            }).then(_ => {
                this.openModal();
            })
            .catch(error => {
                this.error = reduceErrors(error);
                console.log('Error @ onClickOfDate:', this.error);
            });

    }

    checkDateIsAvailable(onClickedDate)
    {
        let flag = false;
        this.dailyLogs.forEach(key =>
        {
            if (key.Date__c == onClickedDate)
            {
                this.recordID = key.Id;
                flag = true;
                console.log(' key.Id:',  key.Id);
            }
        });

        if (flag)
        {
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
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    handleCancel() {
        this.closeModal();
    }

    handleSubmit() {
        this.closeModal();
    }

    editSuccess() {
        this.closeModal();
    }

    handleSuccessNew(event) {
        const evt = new ShowToastEvent({
            title: "Record created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.closeModal();
        this.setDateandCalDetails();
        this.clearDefValues();
    }

    handleSuccessEdit(event)
    {
        const evt = new ShowToastEvent({
            title: "Record Updated",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.closeModal();
        this.setDateandCalDetails();
        this.clearDefValues();
    }

    clearDefValues()
    {
        this.recordID='';
    }
}
