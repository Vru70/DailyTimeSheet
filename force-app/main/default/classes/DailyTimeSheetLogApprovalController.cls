/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 19-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   18-10-2021   Vrushabh Uprikar   Initial Version
**/
public with sharing class DailyTimeSheetLogApprovalController {
    
    public static void submitForApproval(Log_Hour__c logHr) {
        
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting request for approval using Trigger');        
        req.setObjectId(logHr.id);      
        req.setProcessDefinitionNameOrId('Approve_Daily_Logs');      
        Approval.ProcessResult result = Approval.process(req);  
        System.assert(result.isSuccess());
    }
}
