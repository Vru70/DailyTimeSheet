/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 29-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   23-09-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetController 
{

    public static void submitForApproval(Log_Hour__c logHr) {
        
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting request for approval using Trigger');        
        req.setObjectId(logHr.id);      
        req.setProcessDefinitionNameOrId('Approve_Daily_Logs');      
        Approval.ProcessResult result = Approval.process(req);  
        System.debug('result '+result);
        System.assert(result.isSuccess());
    }

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

   //Wrapper class to store the column values of data table
   public class SubmittedRecordsWrapper{
      @AuraEnabled public Id workItemId;
      @AuraEnabled public String recordId;
      @AuraEnabled public String relatedTo;
      @AuraEnabled public String recordName;
      @AuraEnabled public String submittedBy;
      @AuraEnabled public String submittercomment;
      @AuraEnabled public Date submittedDate;
      @AuraEnabled public String comments;
  }

  @AuraEnabled (cacheable=true)
  public static integer getTotalPendingApproval()
  {
      Integer icount = 0;
      List<ProcessInstance> processInstaList = [SELECT Id, TargetObjectId, TargetObject.Name, CreatedDate, (SELECT ID FROM WorkItems WHERE OriginalActorId = : UserInfo.getUserId()) FROM ProcessInstance WHERE TargetObject.Type ='Log_Hour__c'];
      for(ProcessInstance ps : processInstaList )
      {
          if(!ps.WorkItems.isEmpty())
          {
              icount++; // counting Submited Pending Approvals
          }
      }
      System.debug('icount: ' + icount);
      return icount;
  }

  @AuraEnabled
  public static List<SubmittedRecordsWrapper> getSubmittedRecords(Integer queryLimit, Integer queryOffset)
  {
      system.debug('queryLimit '+queryLimit);
      system.debug('queryOffset '+queryOffset);
      List<SubmittedRecordsWrapper> lstSubmissionWrapper = new List<SubmittedRecordsWrapper>();
      //Process instance stores the info of records submitted for approval,
      // Process instance work item are the records an approver sees while approving/rejecting, Process instance step stores approved/rejected record including approva;/rejection comments
      List<ProcessInstance> processInstaList = [SELECT Id,TargetObjectId,TargetObject.Name,CreatedDate,
      (SELECT ID FROM WorkItems WHERE OriginalActorId = : UserInfo.getUserId()),
      (SELECT OriginalActor.Name,Comments FROM Steps WHERE StepStatus = 'Started') FROM ProcessInstance WHERE TargetObject.Type ='Log_Hour__c'
      ORDER BY CreatedDate DESC LIMIT :queryLimit OFFSET :queryOffset];
      for(ProcessInstance ps : processInstaList )
                               {
          if(!ps.WorkItems.isEmpty()){
              SubmittedRecordsWrapper objSubmittedRecordsWrapper = new SubmittedRecordsWrapper();
              objSubmittedRecordsWrapper.workItemId = ps.WorkItems[0].Id;
              objSubmittedRecordsWrapper.recordId = ps.TargetObjectId;
              objSubmittedRecordsWrapper.recordName = ps.TargetObject.Name;
              objSubmittedRecordsWrapper.comments = '';
              objSubmittedRecordsWrapper.relatedTo = 'Log_Hour__c';//get the object name using the record id
              objSubmittedRecordsWrapper.submittedDate = Date.newInstance(ps.CreatedDate.year(),ps.CreatedDate.month(),ps.CreatedDate.day());
              if(!ps.steps.isEmpty()){
                  objSubmittedRecordsWrapper.submittedBy = ps.steps[0].OriginalActor.Name;
                  if(ps.steps[0].Comments == '' || ps.steps[0].Comments == null)
                  objSubmittedRecordsWrapper.submittercomment = 'No comments from submitter';
                  else
                  objSubmittedRecordsWrapper.submittercomment = ps.steps[0].Comments;
                  lstSubmissionWrapper.add(objSubmittedRecordsWrapper);
              }
          }
      }
      system.debug(lstSubmissionWrapper.size());
      System.debug('lstSubmissionWrapper: ' + lstSubmissionWrapper);
      return lstSubmissionWrapper;
  }
  
  @AuraEnabled
  public static String processRecords(String processType,String strwraprecs){
      system.debug('processType'+processType);
      system.debug('wraprecs'+strwraprecs);
      List<SubmittedRecordsWrapper> wraprecs = (List<SubmittedRecordsWrapper>)System.JSON.deserialize(strwraprecs, List<SubmittedRecordsWrapper>.class);
      Map<string,SubmittedRecordsWrapper> mapSubmittedRecordsWrapper = new map<String,SubmittedRecordsWrapper>();
      List<String> lstWorkItemIds = new List<String>();
      for(SubmittedRecordsWrapper iwrap: wraprecs)
      {
          mapSubmittedRecordsWrapper.put(iwrap.workItemId,iwrap);
          lstWorkItemIds.add(iwrap.workItemId);
      }
      
      //Approve,reject the record programmatically
      String message = ''; 
      Integer recordsProcessed = 0;
      String comments = processType == 'Approve' ? 'Approved' : 'Rejected';
      List<Approval.ProcessWorkitemRequest> lstWorkItemRequest = new List<Approval.ProcessWorkitemRequest>();//ProcessWorkitemRequest class has methods to programmatically process submitted records
      for(String workItemId : lstWorkItemIds){
          Approval.ProcessWorkitemRequest objWorkItemRequest = new Approval.ProcessWorkitemRequest();
          if(mapSubmittedRecordsWrapper.containsKey(workItemId))
              objWorkItemRequest.setComments(mapSubmittedRecordsWrapper.get(workItemId).comments);
          else
              objWorkItemRequest.setComments(comments);
          objWorkItemRequest.setAction(processType);//approve or reject
          objWorkItemRequest.setWorkitemId(workItemId);
          lstWorkItemRequest.add(objWorkItemRequest);
      }
      Approval.ProcessResult[] lstProcessResult = Approval.process(lstWorkItemRequest,FALSE);//process method is used for approving/rejecting records depending on setAction attribute
      for(Approval.ProcessResult processResult : lstProcessResult){
          if(processResult.isSuccess()){
              recordsProcessed++;
          }
          else{
              for(Database.Error error : processResult.getErrors()){
                  message += error.getMessage();
              }
          }
      }
      if(recordsProcessed == lstWorkItemIds.size()){
          message = 'All records are '+comments+' successfully';
      }
      System.debug('message: ' + message);
      return message;
  }
}

