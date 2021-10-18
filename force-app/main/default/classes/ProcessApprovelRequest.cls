/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 18-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   14-10-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class ProcessApprovelRequest
{
    /**
    * This method will submit the Log_Hour__c for approval
    **/
    public static void submitForApproval(Log_Hour__c logHr)
    {        
        // Create an approval request for  Log_Hour__c        
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting approval request using Trigger');        
        req.setObjectId(logHr.id);
        // Submit the approval request for the Log_Hour__c        
        Approval.ProcessResult result = Approval.process(req);        
    }     
    
    /**
    *Get ProcessInstanceWorkItemId using SOQL

    ProcessInstanceWorkitem -> Req. 
    **/
    public static Id getWorkItemId(Id targetObjectId)
    {
        Id workItemId = null; // put null ched  k 
        List<ProcessInstanceWorkitem> PIW = [Select p.Id from ProcessInstanceWorkitem p where p.ProcessInstance.TargetObjectId =: targetObjectId];
        for(ProcessInstanceWorkitem workItem  : PIW)
        {
            workItemId  =  workItem.Id;
        }
        return workItemId;
    }

    /**
    * This method will Approve the Log_Hour__c
    **/
    public static void approveRecord(Log_Hour__c logHr)
    {
        Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
        req.setComments('Approving request using Trigger');
        req.setAction('Approve');        
        Id workItemId = getWorkItemId(logHr.id); 
        if(workItemId == null){
            logHr.addError('Error Occured in Trigger');
        }
        else{
            req.setWorkitemId(workItemId);
            // Submit the request for approval
            Approval.ProcessResult result =  Approval.process(req);
        }
    }

    /**
    * This method will Reject the Log_Hour__c
    **/
    public static void rejectRecord(Log_Hour__c logHr){
        Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
        req.setComments('Rejected request using Trigger');
        req.setAction('Reject');
        Id workItemId = getWorkItemId(logHr.id);
        if(workItemId == null){
            logHr.addError('Error Occured in Trigger');
        }
        else{
            req.setWorkitemId(workItemId);
            // Submit the request for approval
            Approval.ProcessResult result =  Approval.process(req);
        }
    }
}
