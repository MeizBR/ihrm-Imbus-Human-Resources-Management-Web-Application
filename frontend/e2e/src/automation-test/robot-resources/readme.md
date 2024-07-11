#####################        Resource files        #############################

Resource files are imported using the Resource setting in the `Settings` section. The path to the resource file is given as an argument to the setting.
When using the plain text format for creating resource files, it is possible to use the normal `.robot` extension but the dedicated `.resource` extension is recommended to separate resource files from test case files.

#####################    Resource file structure   #############################

The higher-level structure of `resource files` is the same as that of `test case files` otherwise, but, of course, they cannot contain `Test Case sections`.
  + Additionally, the Setting section in resource files can contain only import settings (Library, Resource, Variables) and Documentation.
  + The Variable section and Keyword section are used exactly the same way as in test case files.

If several resource files have a user keyword with the same name, they must be used so that the keyword name is prefixed with the resource file name without the extension
  + Exp: myResources.SomeKeyword    &&    common.SomeKeyword
  + if several resource files contain the same variable, the one that is imported first is taken into use.


#####################   Example resource file      #############################

*** Settings ***
Documentation     An example resource file
Library           SeleniumLibrary
Resource          ${RESOURCES}/common.resource

*** Variables ***
${HOST}           localhost:7272
${LOGIN URL}      http://${HOST}/
${WELCOME URL}    http://${HOST}/welcome.html
${BROWSER}        Firefox

*** Keywords ***
Open Login Page
    [Documentation]    Opens browser to login page
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Title Should Be    Login Page

Input Name
    [Arguments]    ${name}
    Input Text    username_field    ${name}

Input Password
    [Arguments]    ${password}
    Input Text    password_field    ${password}
