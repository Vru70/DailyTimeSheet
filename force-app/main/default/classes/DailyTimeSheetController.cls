/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 30-09-2021
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
      List<SObject> dailyLogs = [SELECT Notes__c, Id, Name, Task__c, Date__c, Daily_Log__c, Project__c, Employee__c FROM Log_Hour__c Where CALENDAR_YEAR(Date__c) =:year];
      System.debug('yearInt new: ' + dailyLogs);      
      return dailyLogs;
   }

   // @AuraEnabled
   // public string upsertDailyLogOnDateSelection(Date date, )
   // {
      
   // }
}

