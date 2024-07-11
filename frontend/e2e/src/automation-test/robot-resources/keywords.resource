*** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Resource          keywords.resource



# *** Variables ***
# ${iHRM_VM_URL}      http://192.168.188.207/login
# ${iHRM_LOCAL_URL}      http://localhost:4200/login
# ${WORKSPACE}       the name of the workspace


# *** Keywords ***
# Open iHRM
#     New Browser   chromium    false
#     New Page    ${iHRM_LOCAL_URL}
# Login
#     Open iHRM
#     Fill Text           data-test=workspace >> input              Diligate
#     Fill Text           data-test=login >> input            hm.ameni
#     Fill Text           data-test=password >> input         diligate2019
#     Click               data-test=login-button
#     Get Title           ==                                        iHRM -- HR Management
# Login and Go To Cutomers Page
#     Login
#     click                          data-test=customers
#     Wait For Elements State        data-test=customers-page            visible          timeout=3 seconds
#     Sleep                          2 seconds

# Delete User    [Arguments]         ${selector}
#     Log To Console                 Cleanups Users.......
#     click                          data-test=teams
#     Wait For Elements State        data-test=team-page                 visible       timeout=3 seconds
#     Click                          data-test=${selector}
#     Sleep                          2 seconds
#     Click                          data-test=yes-button
#     Sleep                          2 seconds

# Delete Customer    [Arguments]         ${selector}
#     Log To Console                 Cleanups Customer.......
#     click                          data-test=customers
#     Wait For Elements State        data-test=customers-page            visible          timeout=3 seconds
#     Click                          data-test=${selector}
#     Sleep                          1 seconds
#     Click                          data-test=yes-button
#     Sleep                          1 seconds

# # NOTE: To be implemented add keywords/arguments to login as Admin / as Account Manager




*** Variables ***
${BROWSER}                  chromium
${HEADLESS}                 False
${BASE_URL}                 http://localhost:4200/login
${DEVICE}                   ${None}
${WS_ENDPOINTS}             ${EMPTY}
${PABOTEXECUTIONPOOLID}     0


*** Keywords ***
Open ihrm
    [Documentation]    Opens WebItorx. There are three suite variables that
    ...    can be used to configure the keyword: ${BROWSER}, ${HEADLESS} and ${BASE_URL}
    IF    $WS_ENDPOINTS
        Connect To Browser    ${{$WS_ENDPOINTS.split(',')}}[${PABOTEXECUTIONPOOLID}]    browser=${BROWSER}
    ELSE
        New Browser    ${BROWSER}    headless=${HEADLESS}
    END
    IF    $DEVICE
        ${device_context}    Get Device    ${DEVICE}
        New Context    ignoreHTTPSErrors=True    &{device_context}
    ELSE
        New Context    ignoreHTTPSErrors=True
    END
    New Page    ${BASE_URL}
