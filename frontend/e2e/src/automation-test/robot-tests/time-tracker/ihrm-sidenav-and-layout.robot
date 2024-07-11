*** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite setup       Login



*** Test Cases ***
Check Page Name
    Log                   check application name
    Get Title             ==         iHRM -- HR Management
    Get Text              data-test=time-tracker                ==        Time Tracker
    Get Text              data-test=teams                       ==        Team
    Get Text              data-test=leaves                      ==        Leaves
    Get Text              data-test=events                      ==        Events
    Get Text              data-test=calendars                   ==        Calendars
    Get Text              data-test=projects                    ==        Projects
    Get Text              data-test=customers                   ==        Customers
    Get Text              data-test=tasks                       ==        Tasks
    Get Text              data-test=reports                     ==        Reports
    Get Text              data-test=documents                   ==        Documents
    Get Text              data-test=app-abreviation             ==        iHRM
    Get Text              data-test=app-full-title              ==        imbus Human Resources Management
    Get Text              data-test=user-name                   ==        Ameni HMA
    Get Text              data-test=user-roles                  ==        Administrator
    Sleep                 2 seconds
