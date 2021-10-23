/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 23-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   23-09-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetController 
{
   @AuraEnabled(cacheable = true)
   public static List<SObject> getAllDailyLogs(Integer year, String id ) {
      try {
         List<SObject> dailyLogs = [SELECT Id, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c FROM Log_Hour__c Where CALENDAR_YEAR(Date__c) =:year AND CreatedById =:id Order by Date__c] ;
         System.debug('yearInt new: ' + dailyLogs);      
         return dailyLogs;
      } catch(Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getAllDailyLogs'+e.getMessage());
      }
   }

   @AuraEnabled
   public static List<SObject> getTaskListByDay(String strDate, String id) {
      try {
         Date selectedDate = date.valueOf(strDate);
         List<SObject> tasklist = [SELECT Id, Name, Daily_Task__r.Name, Daily_Log_Hour__c, Daily_Log_Mins__c , Date__c,Project__c, CreatedBy.Name FROM Log_Hour__c Where Date__c =:selectedDate AND CreatedById =:id Order By Daily_Log_Hour__c];
         System.debug('tasklist: ' + tasklist);      
         return tasklist;
      } catch(Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getTaskListByDay'+e.getMessage());
      }
   }

   @AuraEnabled
   public static List<SObject> getUserNameUnderManager(String Id) {
      try {
         List<SObject> usersList = [Select Id, Name, ManagerId From User where ManagerId =:Id] ;
         System.debug('usersList: ' + usersList);      
         return usersList; 
      } catch (Exception e) {
         throw new AuraHandledException('Error @ DailyTimeSheetController.getUserNameUnderManager'+e.getMessage());
      }
   }
}

