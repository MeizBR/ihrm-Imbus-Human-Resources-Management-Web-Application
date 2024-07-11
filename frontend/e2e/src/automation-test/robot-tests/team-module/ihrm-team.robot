*** Settings ***
Library           Browser
Library           String
Library           DateTime
Library           BuiltIn
Resource          ../../robot-resources/keywords.resource
Suite Setup       Log in
Suite Teardown     Delete User    delete-item-0


# Data needed for this robot file
#    User 1:  firstName: Ameni  lastName: HMA    hm.ameni  hm.ameni@diligate.tn
#    User 2:  firstName: New Member  lastName: To Add    new-member  new-member@diligate.tn
#    User 2:  firstName: New Member  lastName: To Add    new-member-9-26(indiferent)  new-member-9-26@diligate.tn(indiferent)

*** Test Cases ***
Check Add User
    click                         data-test=teams
    Wait For Elements State       data-test=team-page                 visible       timeout=3 seconds
    Click                         data-test=create-user
    Sleep                         1 second
    Get Text                      data-test=first-name-label           ==           first name
    Get Text                      data-test=last-name-label            ==           last name
    Get Text                      data-test=login-label                ==           login
    Get Text                      data-test=email-label                ==           email
    Get Text                      data-test=password-label             ==           password
    Get Text                      data-test=confirm-password-label     ==           Confirm password
    Click                         data-test=cancel-button

Check Add User With Inadequate Form
    Click                        data-test=create-user
    Sleep                        1 second
    Fill Text                    data-test=first-name-label            de
    Fill Text                    data-test=last-name-label             df
    Fill Text                    data-test=login-label                 cy
    Fill Text                    data-test=email-label                 fjbjfb
    Fill Text                    data-test=password-label              5484
    Fill Text                    data-test=confirm-password-label      5454
    Click                        data-test=active-button

    Get Text                     data-test=first-name-errormsg         ==         Minimum of 3 characters are required.
    Get Text                     data-test=last-name-errormsg          ==         Minimum of 3 characters are required.
    Get Text                     data-test=login-errormsg              ==         Minimum of 3 characters are required.
    Get Text                     data-test=email-errormsg              ==         Email address not valid.
    Get Text                     data-test=password-errormsg           ==         Minimum of 6 characters are required.
    Get Text                     data-test=confirm-password-errormsg   ==         Minimum of 6 characters are required.

Check Cancel Button
    Get Text                     data-test=cancel-button               ==         Cancel
    Click                        data-test=cancel-button

Check Add Button
    Click                        data-test=create-user
    Get Text                     data-test=add-button                  ==        Add
    Fill Text                    data-test=first-name-label            New Member
    Fill Text                    data-test=last-name-label             To Add
    ${nowTime}                   Get Current Date                      result_format=datetime
    ${uniqLogin} =               Catenate                              new-member-${nowTime.minute}-${nowTime.second}
    ${uniqEmail} =               Catenate                              new-member-${nowTime.minute}-${nowTime.second}@diligate.tn
    Fill Text                    data-test=login-label                 ${uniqLogin}
    Fill Text                    data-test=email-label                 ${uniqEmail}
    Fill Text                    data-test=password-label              diligate2019
    Fill Text                    data-test=confirm-password-label      diligate2019
    Fill Text                    data-test=registration-number-input   31
    Sleep                        2 seconds
    Click                        data-test=add-button

Check user header
    Wait For Elements State      data-test=user-header             visible       timeout=3 seconds
    Get Text                     data-test=users-tab               ==            Users
    Get Text                     data-test=users-icon              ==            folder_shared
    Get Text                     data-test=users-details-tab       ==            Users Details
    Get Text                     data-test=users-details-icon      ==            list_alt

Check header cells name
    Get Element Count            mat-header-cell                   ==    7.0
    Get Text                     data-test=globalRoles
    Get Text                     data-test=user                    ==    User
    Get Text                     data-test=login                   ==    Login
    Get Text                     data-test=email                   ==    Email
    Get Text                     data-test=registrationNumber      ==    Registration number
    Get Text                     data-test=active                  ==    Active

Check Names in Users Details page
    Click                         data-test=edit-item-2
    Sleep                         8 seconds
    Get Text                      data-test=all-users-header     ==          All Users
    Get Text                      data-test=user-info-0          ==          Ameni HMA
    Get Text                      data-test=user-info-1          ==          New Member To Add
    Get Text                      data-test=user-info-2          ==          New Member To Add

Check profile
    Get Text                      data-test=first-name           ==          First name :
    Get Text                      data-test=first-name-input     ==          Ameni
    Get Text                      data-test=last-name            ==          Last name :
    Get Text                      data-test=last-name-input      ==          HMA
    Get Text                      data-test=login                ==          Login :
    Get Text                      data-test=login-input          ==          hm.ameni
    Get Text                      data-test=email                ==          Email :
    Get Text                      data-test=email-input          ==          hm.ameni@diligate.tn
    Get Text                      data-test=password
    Get Text                      data-test=new-pwd
    Get Text                      data-test=confirm-pwd
    Click                         data-test=is-active-toggler
    Get Text                      data-test=save-button          ==           Save
    Get Text                      data-test=cancel-button        ==           Cancel
