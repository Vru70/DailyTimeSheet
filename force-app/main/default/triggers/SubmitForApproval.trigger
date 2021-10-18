/**
 * @author            : Vrushabh Uprikar
 * @last modified on  : 14-10-2021
 * @last modified by  : Vrushabh Uprikar
 * Modifications Log
 * Ver   Date         Author             Modification
 * 1.0   14-10-2021   Vrushabh Uprikar   Initial Version
**/
trigger SubmitForApproval on Log_Hour__c (after insert,after update)
{
    for(Log_Hour__c logHr:trigger.New)
    {       
        try{
            if(Trigger.isInsert)
            {
                if(logHr.Status__c == 'Submit')
                {
                    ProcessApprovelRequest.submitForApproval(logHr);
                }
                else if(logHr.Status__c == 'Approve')
                {
                    ProcessApprovelRequest.approveRecord(logHr);
                }
                else if(logHr.Status__c == 'Reject')
                {
                    ProcessApprovelRequest.rejectRecord(logHr);
                }
            }
            else if(Trigger.isUpdate)
            {
                Log_Hour__c logHrOld=Trigger.OldMap.get(logHr.Id);

                if( logHr.Status__c == 'Submit' && logHrOld.Status__c != 'Submit')
                {
                    ProcessApprovelRequest.submitForApproval(logHr);
                }
                else if(logHr.Status__c == 'Approve' && logHrOld.Status__c != 'Approve')
                {
                    ProcessApprovelRequest.approveRecord(logHr);
                }
                else if(logHr.Status__c == 'Reject' && logHrOld.Status__c != 'Reject')
                {
                    ProcessApprovelRequest.rejectRecord(logHr);
                }
            }
        }
        catch(Exception e)
        {
            logHr.addError(e.getMessage());
        }
    }
}
