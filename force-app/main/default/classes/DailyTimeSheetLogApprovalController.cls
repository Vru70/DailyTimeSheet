/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 18-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   18-10-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetLogApprovalController 
{
    // will submit the Log_Hour__c for approval
    public static void submitForApproval(Log_Hour__c logHr)
    {
        // Create an approval request for  Log_Hour__c        
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting request for approval using Trigger');        
        req.setObjectId(logHr.id);      
        
        // Submit the record to specific process and skip the criteria evaluation
        req.setProcessDefinitionNameOrId('Approve_Daily_Logs');

        // Submit the approval request for the Log_Hour__c        
        Approval.ProcessResult result = Approval.process(req);  

        // Verify the result
        System.assert(result.isSuccess());
    }
}
