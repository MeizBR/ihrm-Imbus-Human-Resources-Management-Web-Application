*** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource

Suite setup       Go To Projects


*** Test Cases ***
Create A New Project
    Click        data-test=create-project
    Sleep        2 seconds
    Get Element State        data-test=add-project-button        disabled    ==    True

Fill The Customer Field
    Click        data-test=customer
    ${customers-list}        Get Elements        data-test=customer_label
    Click        ${customers-list}[1]
    Sleep        2 seconds

Fill The Project Name Field
    Fill Text        data-test=project-name        some project

Toggle To Active Status
    Click        data-test=active-button
    Sleep        2 seconds

Fill The Description Field
    Wait For Elements State        data-test=description-text            visible                   timeout=2
    Fill Text    data-test=description-text >> p       designed & edited by!
    Sleep        2 seconds

Fill The Description Field
    Wait For Elements State        data-test=description-text            visible                   timeout=2
    Fill Text    data-test=description-text >> p       some comment !
    Sleep        2 seconds

Add The Project
    Get Element State        data-test=add-project-button        disabled    ==    False
    Get Element State        data-test=cancel-project-button        enabled    ==    True
    Click        data-test=add-project-button
