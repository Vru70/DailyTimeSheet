/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 28-09-2021
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
      List<SObject> dailyLogs = [Select Id, Name, Daily_Log__c, Date__c, Notes__c From Log_Hour__c Where CALENDAR_YEAR(Date__c) =:year];
      System.debug('yearInt new: ' + dailyLogs);      
      return dailyLogs;
   }

   // @AuraEnabled
   // public string upsertDailyLogOnDateSelection(Date date, )
   // {
      
   // }
}

