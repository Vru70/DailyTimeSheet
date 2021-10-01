trigger Log_HourTrigger on Log_Hour__c (before insert)
{
    Set<Date> setOfDate = new Set<Date>();
    for(Log_Hour__c logHr : Trigger.New)
    {
        setOfDate.add(logHr.Date__c); 
    }
    
    if(setOfDate.size() > 0)
    {
        List<Log_Hour__c> listOfLoginHr = [Select id, Date__c from Log_Hour__c where Date__c IN :setOfDate];
        Map<Date,Log_Hour__c> mapDateLogs = new Map<Date,Log_Hour__c>();
        for(Log_Hour__c logHr : listOfLoginHr)
        {
            mapDateLogs.put(logHr.Date__c, logHr);
        } 
    
    
    for(Log_Hour__c logHr: Trigger.New)
    {
        if(mapDateLogs.containsKey(logHr.Date__c))
        {
            logHr.Date__c.addError('Date Logs already Exist');
        }
    }
  } 
}