** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite Setup       Login and Go To Cutomers Page


*** Variables ***
${iHRM_VM_URL}      http://192.168.188.207/login
${iHRM_LOCAL_URL}      http://localhost:4202

* Test Cases ***
Check Page Content
        Get Url                       ==                            ${iHRM_LOCAL_URL}/home/customers
        Sleep                         1 seconds
        Wait For Elements State       app-customers-header          visible      timeout=3 seconds
        Wait For Elements State       .customers-wrapper            visible      timeout=3 seconds

Check Customers Page Header
        Wait For Elements State       data-test=cutomer-header              visible         timeout=3 seconds
        Get Text                      data-test=customers_tab               ==              Customers
        Get Text                      data-test=customers_icon              ==              support_agent
        Get Text                      data-test=customers_details_tab       ==              Customer Details
        Get Text                      data-test=customers_details_icon      ==              list_alt

Check Search Placeholder
        click                         data-test=customers
        Wait For Elements State       data-test=customers-page    visible    timeout=3 seconds
        Sleep                         1 seconds
        Get Text                      data-test=search-field

Check Search
        Fill Text                     data-test=search-input          Imbus AG
        Sleep                         1 seconds
        ${customerInFilter}           Get Elements                    data-test=name
        Log To Console                ${customerInFilter}
        # TODO: Check (Maybe Bug here!! ) filter non functional

Check header cells name
        Get Element Count             mat-header-cell           ==    3
        Get Text                      data-test=name            ==    Name
        Get Text                      data-test=active          ==    Active

# TODO: New test case to check the customers table content
