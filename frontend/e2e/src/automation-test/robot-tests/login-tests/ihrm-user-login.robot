*** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite Setup       Open iHRM

*** Test Cases ***
Check Page Name
    Open ihrm
    Log                           Check application name
    Get Title                     ==                                     iHRM -- HR Management
    Get Text                      data-test=company-title                ==                         @Diligate 2021
    Get Text                      data-test=app-title                    ==                         iHRM\nimbus Human Resource Management

Check Login Form
    Log                           Check login form elements
    Get Text                      data-test=sign-in                           ==            Sign In
    Get Text                      data-test=workspace                   ==            Workspace *
    Get Text                      data-test=login                       ==            Login *
    Get Text                      data-test=password                    ==            Password *
    Get Attribute                 data-test=login-button               disabled       ==        true
    Sleep                         2 seconds

Login With Wrong Credentials
    Log                           Test login with wrong credentials
    Fill Text                     data-test=workspace >> input                        wrongWS
    Fill Text                     data-test=login >> input                            wrongLogin
    Fill Text                     data-test=password >> input                         wrongPWD
    Click                         data-test=login-button
    Get Text                      data-test=error-msg                                   ==                  Invalid credentials. Please try again.\nwarning

Log In With Rigth Credentials
    Log                           Test login with rigth credentials
    Fill Text                     data-test=workspace >> input                         Diligate
    Fill Text                     data-test=login >> input                             hm.ameni
    Fill Text                     data-test=password >> input                          diligate2019
    Click                         data-test=login-button
    Sleep                         5 seconds
    Get Title                     ==                                                   iHRM -- HR Management
    Wait For Elements State       data-test=activities-page                              visible             timeout=3 seconds

Check Titles In Header
    Log                           check application header after login
    Get Text                      data-test=app-abreviation              ==             iHRM
    Get Text                      data-test=app-full-title               ==             imbus Human Resources Management
    Get Text                      data-test=user-name                    ==             Ameni HMA
    Get Text                      data-test=user-roles                   ==             Administrator

Check Sidenav Names
    Log                           check application sidenav after login
    Get Text                      data-test=time-tracker                 ==             Time Tracker
    Get Text                      data-test=teams                        ==             Team
    Get Text                      data-test=leaves                       ==             Leaves
    Get Text                      data-test=events                       ==             Events
    Get Text                      data-test=calendars                    ==             Calendars
    Get Text                      data-test=projects                     ==             Projects
    Get Text                      data-test=customers                    ==             Customers
