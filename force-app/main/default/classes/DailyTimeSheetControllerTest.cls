/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 05-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   01-10-2021   Vrushabh Uprikar   Initial Version
**/
@isTest
public class DailyTimeSheetControllerTest 
{
	@isTest
    public static void getAllDailyLogsTest()
    {
        Task__c task = new Task__c();
        task.Name = 'taskTestName';
        insert task;
        
        Log_Hour__c logHour = new Log_Hour__c();
        logHour.Task__c = task.Id;
        logHour.Date__c = date.newInstance(2021, 09, 15);
        logHour.Daily_Log_Hour__c = '08';
        logHour.Daily_Log_Mins__c = '30';
        insert logHour;
        
        List<SObject> listSobject = DailyTimeSheetController.getAllDailyLogs(2021);
        Log_Hour__c logHourAssert = (Log_Hour__c)listSobject[0];
        
        System.assertEquals(logHourAssert.Date__c, logHour.Date__c);
    }
}
