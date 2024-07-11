** Settings ***
Library           Browser
Library           String
Library           BuiltIn
Library           DateTime
Resource          ../../robot-resources/keywords.resource
Suite Setup       Login and Go To Cutomers Page
Suite Teardown    Delete Customer    delete-item-1


* Test Cases ***
Check Add Custommer
        Click                          data-test=create-customer
        Get Text                       data-test=name-label                ==                Name
        Get Text                       data-test=description-label         ==                Description:

Check Add Customer With Inadequate Form
        click                          data-test=customers
        Fill Text                      data-test=name-label                   ci
        Click                          data-test=is-active-label
        Get Text                       data-test=error-msg                    ==        Minimum of 3 characters are required.
        Sleep                          1 seconds
        Click                          data-test=is-active-label
        Fill Text                      data-test=name-label                   Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
        Get Text                       data-test=error-msg                    ==        Name is too long, max of 255 characters are allowed.

Check Add Button
    ${nowTime}                         Get Current Date                   result_format=datetime
    ${CustomerToAdd} =                 Catenate                           New Customer ${nowTime.minute}-${nowTime.second}
    Fill Text                          data-test=name-label               ${CustomerToAdd}
    Get Text                           data-test=add-button               ==                          Add
    Click                              data-test=add-button
    # TODO: Check That the snack bar is displayed

Check Cancel Button
        Click                          data-test=create-customer
        Get Text                       data-test=cancel_button            ==               Cancel
        Click                          data-test=cancel_button
        Wait For Elements State        data-test=create-customer          visible          timeout=3 seconds

# TODO: New test case to check the error while adding new customer with an existing name

Cleanups Delete Added Custemer
        Wait For Elements State          data-test=delete-item-2            visible          timeout=3 seconds
        Click                            data-test=delete-item-2
