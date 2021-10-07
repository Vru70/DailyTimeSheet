/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 07-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   23-09-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetController 
{
   @AuraEnabled(cacheable = true)
   public static List<SObject> getAllDailyLogs(Integer year)
   {
      List<SObject> dailyLogs = [SELECT Notes__c, Id, Name, Task__c, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c, Project__c, Employee__c FROM Log_Hour__c Where CALENDAR_YEAR(Date__c) =:year Order by Date__c] ;
      System.debug('yearInt new: ' + dailyLogs);      
      return dailyLogs;
   }

   @AuraEnabled
   public static List<SObject> getTaskListByDay(String strDate)
   {
      Date selectedDate = date.valueOf(strDate);
      List<SObject> tasklist = [SELECT Id, Name, Task__c, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c,Project__c, Employee__c FROM Log_Hour__c Where Date__c =:selectedDate Order By Daily_Log_Hour__c];
      System.debug('tasklist: ' + tasklist);      
      return tasklist;
   }
}

