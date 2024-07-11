*** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite setup       Login


*** Test Cases ***
Check Current Activity Details
    Wait For Elements State      data-test=activities-page                 visible                   timeout=2 s
    Wait For Elements State      data-test=activity-description            visible                   timeout=2 s
    Get Attribute                data-test=activity-description            placeholder     ==        What are you working on ?

Check If Start Button Is Enabled
    Wait For Elements State      data-test=start-button                visible                   timeout=2 s
    Get Attribute                data-test=start-button                disabled        ==        true

Add A New Project
    Get Text                     data-test=time-runner                   ==        00:00:00
    Fill Text                    data-test=activity-description          automation-tester
    Click                        data-test=add-project
    Click                        data-test=item-selection-0
    Fill Text                    data-test=activity-description          automation-tester

Run The Start Button
    Get Text                     data-test=start-button                  ==        Start
    Click                        data-test=start-button
    Sleep                        5 seconds
