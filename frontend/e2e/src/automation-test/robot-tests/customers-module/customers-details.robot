** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite Setup       Login and Go To Cutomers Page


* Test Cases ***
Check Customers header
        Wait For Elements State       data-test=cutomer-header             visible        timeout=3 seconds
        Get Text                      data-test=customers_tab              ==             Customers
        Get Text                      data-test=customers_icon             ==             support_agent
        Get Text                      data-test=customers_details_tab      ==             Customer Details
        Get Text                      data-test=customers_details_icon     ==             list_alt


Check All Customers Details Section
        Click                        data-test=edit-item-0
        Get Text                     data-test=all_customers               ==   All Customers
        Get Text                     data-test=customer-info-0             ==   New Costumer
        Get Text                     data-test=customer-info-1             ==   New Customer 0-47

Check Customers Details Section
        Get Text                     data-test=description-label           ==   Description:
        Get Text                     data-test=is-active-label             ==   Active
        Click                        data-test=is-active-label
        Get Text                     data-test=save-button                 ==   Save
        Get Text                     data-test=cancel-button               ==  Cancel


