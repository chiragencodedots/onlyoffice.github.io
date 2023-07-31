/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


(function (window, undefined) {
    // Declare variables
    var flagInit = false;
    var fClickLabel = false;
    var fClickBtnCur = false;
    var displayNoneClass = "d-none";
    var disabledClass = "disabled";
    var toggleInviteUsersDivShow = true;
    var authToken = '';
    var documentID = '';
    var documentMode = '';
    var inviteTeamListIDs = [];
    var inviteUserListIDs = [];
    var selectedInvitedUsers = [];
    var selectedInvitedTeams = [];
    var apiBaseUrl = 'http://localhost:3000/api/v1/app';
    var IMAGE_USER_PATH_LINK = 'https://propact.s3.amazonaws.com/';
    var clauseRecordLimit = 10;
    var clauseNextPage = 1;
    var clauseHasNextPage = true;
    var searchText = '';
    var searchTimeout;


    // /********************* Plugin Init - Start CM *********************/ //

    window.Asc.plugin.init = function (text) {

        //event "init" for plugin
        window.Asc.plugin.executeMethod("GetAllContentControls");
        fBtnGetAll = true;

        /**====================== Get & Set variables ======================*/
        documentID = getDocumentID(window.Asc.plugin.info.documentCallbackUrl);
        documentMode = getDocumentMode(window.Asc.plugin.info.documentCallbackUrl);
        authToken = window.Asc.plugin.info.documentCallbackUrl.split('/').pop();
        /**====================== Get & Set variables ======================*/

        /**
         * @desc If text is not selected or contract is in markup mode than disable the create clause button
         */
        if (documentMode == 'markup') {
            document.getElementById('btnCreateClause').classList.add(disabledClass);
        } else {
            if (text) {
                document.getElementById('btnCreateClause').classList.remove(disabledClass);
            } else {
                if (!document.getElementById('btnCreateClause').classList.contains(disabledClass)) {
                    document.getElementById('btnCreateClause').classList.add(disabledClass);
                }
            }
        }

        /**
         * @desc Get the open contract and user details
         */
        if (documentID && authToken && !flagInit) {
            getOpenContractUserDetails();
        }

        // Invite counterparty screen
        const varBtnRedirectInviteCounterpartyForm = document.getElementById('btnRedirectInviteCounterpartyForm');
        varBtnRedirectInviteCounterpartyForm.addEventListener('click', function () {
            document.getElementById('divInviteCounterparty').classList.add(displayNoneClass);
            document.getElementById('divInviteCounterpartyForm').classList.remove(displayNoneClass);
        });
        // Invite counterparty screen

        // Invite counterparty Form screen
        const varBtnRedirectInviteCounterpartyCancel = document.getElementById('btnRedirectInviteCounterpartyCancel');
        varBtnRedirectInviteCounterpartyCancel.addEventListener('click', function () {
            document.getElementById('divInviteCounterparty').classList.remove(displayNoneClass);
            document.getElementById('divInviteCounterpartyForm').classList.add(displayNoneClass);
        });
        // Invite counterparty Form screen

        // Invite counterparty Pending screen
        const varBtnResendVerification = document.getElementById('btnResendVerification');
        varBtnResendVerification.addEventListener('click', function () {
            resendCounterpartyInvitation();
        });

        const varBtnCancelInvitation = document.getElementById('btnCancelInvitation');
        varBtnCancelInvitation.addEventListener('click', function () {
            cancelInvitation();
        });
        // Invite counterparty Pending screen

        // Contract clause lists screen
        const varBtnCreateClause = document.getElementById('btnCreateClause');
        varBtnCreateClause.addEventListener('click', function () {
            if (text) {
                document.getElementById('divContractLists').classList.add(displayNoneClass);
                document.getElementById('divContractCreate').classList.remove(displayNoneClass);
                toggleInviteUsersDivShow = true;
            }
        });

        const buttonsOpenChatBoard = document.querySelectorAll('.contract-item');
        // Add a click event listener to each button element
        buttonsOpenChatBoard.forEach(function (button) {
            button.addEventListener('click', function () {
                document.getElementById('divContractLists').classList.add(displayNoneClass);
                document.getElementById('divContractChatHistory').classList.remove(displayNoneClass);
            });
        });
        // Contract clause lists screen

        // Create contract clause screen
        const varBtnContractCreateClose = document.getElementById('btnContractCreateClose');
        varBtnContractCreateClose.addEventListener('click', function () {
            document.getElementById('divContractLists').classList.remove(displayNoneClass);
            document.getElementById('divContractCreate').classList.add(displayNoneClass);
        });

        const varBtnContractCreateCancel = document.getElementById('btnContractCreateCancel');
        varBtnContractCreateCancel.addEventListener('click', function () {
            document.getElementById('divContractLists').classList.remove(displayNoneClass);
            document.getElementById('divContractCreate').classList.add(displayNoneClass);
        });
        // Create contract clause screen

        // Contract chat history screen
        const varBtnRedirectClauseListsA = document.getElementById('btnRedirectClauseListsA');
        varBtnRedirectClauseListsA.addEventListener('click', function () {
            document.getElementById('divContractLists').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnGoToSameSideChat = document.getElementById('btnGoToSameSideChat');
        varBtnGoToSameSideChat.addEventListener('click', function () {
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnGoToCounterparty = document.getElementById('btnGoToCounterparty');
        varBtnGoToCounterparty.addEventListener('click', function () {
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });
        // Contract chat history screen

        // Contract sameside chat screen
        const varBtnGoToCounterpartyA = document.getElementById('btnGoToCounterpartyA');
        varBtnGoToCounterpartyA.addEventListener('click', function () {
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnRedirectClauseListsB = document.getElementById('btnRedirectClauseListsB');
        varBtnRedirectClauseListsB.addEventListener('click', function () {
            document.getElementById('divContractLists').classList.remove(displayNoneClass);
            document.getElementById('divContractSameSideChat').classList.add(displayNoneClass);
        });
        // Contract sameside chat screen

        // Toggle inviteuser tabs view
        document.getElementById('inviteUsersInput').addEventListener('click', function () {
            if (toggleInviteUsersDivShow) {
                document.getElementById('inviteUsersBox').classList.remove(displayNoneClass);
            } else {
                document.getElementById('inviteUsersBox').classList.add(displayNoneClass);
            }
            toggleInviteUsersDivShow = !toggleInviteUsersDivShow;
        });

        // Clause Lazyload functionality
        document.getElementById('contractListItemsDiv').onscroll = (e) => {
            if (document.getElementById('contractListItemsDiv').scrollTop + document.getElementById('contractListItemsDiv').offsetHeight >= document.getElementById('contractListItemsDiv').scrollHeight) {
                if (clauseHasNextPage) {
                    getContractSectionList();
                    console.log(clauseNextPage, clauseHasNextPage);
                }
                console.log("End");
            }
        }

        // Clause listing screen - Search input
        document.getElementById('inputSearchbox').addEventListener('keyup', function (event) {
            clearTimeout(searchTimeout); // Clear any existing timeout

            // Set a new timeout to call performSearch after 800 milliseconds (adjust as needed)
            searchTimeout = setTimeout(function () {
                if (searchText != event.target.value.trim()) {
                    document.getElementById('contractListItemsDiv').innerHTML = '';
                    searchText = event.target.value.trim();
                    clauseNextPage = 1;
                    clauseHasNextPage = true;
                    getContractSectionList();
                } else {
                    searchText = '';
                    clauseNextPage = 1;
                    clauseHasNextPage = true;
                    getContractSectionList();
                }
            }, 500);
        });



        /** Invite counterparty form submit */
        $("#inviteForm").validate({
            submitHandler: function (form) {
                // $(form).ajaxSubmit();
                inviteCounterparties();
            }
        });

        /** Clause create form submit */
        $("#clauseForm").validate({
            submitHandler: function (form) {
                createClauseSection();
            }
        });

        $(document).on('click', '#inviteteams', function () {
            $('.team-chkbox').prop('checked', this.checked);
            updateInviteTeamCheckbox();
        })

        $(document).on('click', '.team-chkbox', function () {
            var allChecked = $('.team-chkbox:checked').length === $('.team-chkbox').length;
            $('#inviteteams').prop('checked', allChecked);
            updateInviteTeamCheckbox();
        });

        $(document).on('click', '#inviteusers', function () {
            $('.user-chkbox').prop('checked', this.checked);
            updateInviteUserCheckbox();
        })

        $(document).on('click', '.user-chkbox', function () {
            var allChecked = $('.user-chkbox:checked').length === $('.user-chkbox').length;
            $('#inviteusers').prop('checked', allChecked);
            updateInviteUserCheckbox();
        });

    };

    window.Asc.plugin.onMethodReturn = function(returnValue)
    {
        //evend return for completed methods
        var _plugin = window.Asc.plugin;
        if (_plugin.info.methodName == "GetAllContentControls") {
            if (fBtnGetAll) {
                // document.getElementById("divP").innerHTML = "";
                fBtnGetAll = false;
                for (var i = 0; i < returnValue.length; i++) {
                    // addLabel(returnValue[i], "#divP");
                    console.log('returnValue', returnValue);
                }
            } else {
                // document.getElementById("divG").innerHTML = "";
                for (var i = 0; i < returnValue.length; i++) {
                    // addLabel(returnValue[i], "#divG");
                    console.log('returnValue', returnValue);
                }
            }
        }  else if (_plugin.info.methodName == "GetCurrentContentControl") {
            console.log('Fn called', _plugin);
            console.log('Fn called', returnValue);
            if (fClickBtnCur) {
                //method for select content control by id
                window.Asc.plugin.executeMethod("SelectContentControl",[returnValue]);
                fClickBtnCur = false;
            } else if (!($('.label-selected').length && $('.label-selected')[0].id === returnValue) && returnValue) {
                if (document.getElementById(returnValue))
                {
                    $('.label-selected').removeClass('label-selected');
                    // $('#divG #' + returnValue).addClass('label-selected');
                    // $('#divP #' + returnValue).addClass('label-selected');


                } else {
                    $('.label-selected').removeClass('label-selected');
                    // addLabel({InternalId: returnValue},"#divG");
                    // $('#' + returnValue).addClass('label-selected');
                }
            } else if (!returnValue) {
                $('.label-selected').removeClass('label-selected');
            }
        }
    };



    window.Asc.plugin.event_onTargetPositionChanged = function()
    {
        //event change cursor position
        //all events are specified in the config file in the "events" field
        if (!fClickLabel) {
            //menthod for get current content control (where is the cursor located)
            window.Asc.plugin.executeMethod("GetCurrentContentControl");
        }
        fClickLabel = false;
    };


    /**====================== Utils Function Start ======================*/
    /**
     * @param url
     * @returns {*|string}
     */
    function getDocumentID(url) {
        const urlArr = url.split('/');
        return urlArr[urlArr.length - 4];
    }

    /**
     * @param url
     * @returns {*|string}
     */
    function getDocumentMode(url) {
        const urlArr = url.split('/');
        return urlArr[urlArr.length - 2];
    }

    /**
     * Update invite team checkbox
     */
    function updateInviteTeamCheckbox() {
        console.log('selectedInvitedTeams', selectedInvitedTeams);
        $('.team-chkbox').each(function () {
            let isChecked = $(this).prop("checked");
            let dataID = $(this).parent().data('id');
            let jsonData = inviteTeamListIDs.find((ele) => ele.itemId == dataID);
            if (isChecked) {
                if (selectedInvitedTeams.findIndex((ele) => ele.itemId == jsonData.itemId) < 0) {
                    selectedInvitedTeams.push(jsonData);
                }
            } else {
                if (selectedInvitedTeams.findIndex((ele) => ele.itemId == jsonData.itemId) > -1) {
                    selectedInvitedTeams = $.grep(selectedInvitedTeams, function (value) {
                        return value.itemId != dataID;
                    });
                }
            }
        })
        console.log('selectedInvitedTeams', selectedInvitedTeams);
        updateInviteUsersPlacehoder();
    }

    /**
     * Update invite user checkbox
     */
    function updateInviteUserCheckbox() {
        console.log('selectedInvitedUsers', selectedInvitedUsers);
        $('.user-chkbox').each(function () {
            let isChecked = $(this).prop("checked");
            let dataID = $(this).parent().data('id');
            let jsonData = inviteUserListIDs.find((ele) => ele.itemId == dataID);
            if (isChecked) {
                if (selectedInvitedUsers.findIndex((ele) => ele.itemId == jsonData.itemId) < 0) {
                    selectedInvitedUsers.push(jsonData);
                }
            } else {
                if (selectedInvitedUsers.findIndex((ele) => ele.itemId == jsonData.itemId) > -1) {
                    selectedInvitedUsers = $.grep(selectedInvitedUsers, function (value) {
                        return value.itemId != dataID;
                    });
                }
            }
        });
        console.log('selectedInvitedUsers', selectedInvitedUsers);
        updateInviteUsersPlacehoder();
    }

    /**
     * @desc Update the placeholder of Invite user input
     */
    function updateInviteUsersPlacehoder() {
        let placeholderText = 'Select users and teams';
        let placeholderTextArray = [];
        if (selectedInvitedUsers && selectedInvitedUsers.length > 0) {
            placeholderTextArray.push(selectedInvitedUsers.length + (selectedInvitedUsers.length == 1 ? ' User' : ' Users'));
        }
        if (selectedInvitedTeams && selectedInvitedTeams.length > 0) {
            placeholderTextArray.push(selectedInvitedTeams.length + (selectedInvitedTeams.length == 1 ? ' Team' : ' Teams'));
        }
        if (placeholderTextArray.length > 0) {
            placeholderText = placeholderTextArray.join(' and ') + ' Selected';
        }
        document.getElementById('inviteUsersInput').placeholder = placeholderText;
    }

    /**====================== Utils Function End ======================*/


    /**====================== API Function Start ======================*/
    /**
     * @desc Get open contract and user details
     */
    function getOpenContractUserDetails() {
        const getContractUserDetailsUrl = apiBaseUrl + '/contract/getOpenContractUserDetails/' + documentID;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'GET',
            headers: headers,
        };
        fetch(getContractUserDetailsUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                const responseData = data;
                if (responseData && responseData.status == true && responseData.code == 200 && responseData.data) {
                    if (responseData.data.openContractDetails && responseData.data.openContractDetails.counterPartyInviteStatus == 'Accepted') {
                        if (documentMode !== 'markup') {
                            var sDocumentEditingRestrictions = "readOnly";
                            window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                        }
                    }
                    flagInit = true;
                    if (responseData.data.invitationDetail && responseData.data.invitationDetail._id) {
                        document.getElementById('divInviteCounterparty').classList.add(displayNoneClass);
                        document.getElementById('divInviteCounterpartyPending').classList.remove(displayNoneClass);
                        document.getElementById('organizationName').textContent = responseData.data.invitationDetail.organizationName;
                        document.getElementById('counterpartyName').textContent = responseData.data.invitationDetail.firstName + " " + responseData.data.invitationDetail.lastName;
                    } else if (responseData.data.oppositeUser && responseData.data.oppositeUser._id) {
                        document.getElementById('divInviteCounterpartyPending').classList.add(displayNoneClass);
                        document.getElementById('divInviteCounterparty').classList.add(displayNoneClass);
                        document.getElementById('invitationActionPara').classList.add(displayNoneClass);
                        document.getElementById('divContractLists').classList.remove(displayNoneClass);
                        document.getElementById('contractCounterpartySection').classList.remove(disabledClass);
                        document.getElementById('userProfileImage').src = responseData.data.loggedInUserDetails.imageUrl;
                        document.getElementById('counterpartyImage').src = responseData.data.oppositeUser.imageUrl;
                        document.getElementById('organizationImage').src = responseData.data.oppositeUser.company.imageUrl;
                        document.getElementById('userProfileName').textContent = responseData.data.loggedInUserDetails.firstName + " " + responseData.data.loggedInUserDetails.lastName;
                        document.getElementById('userProfilerole').textContent = responseData.data.loggedInUserDetails.role;
                        document.getElementById('organizationName').textContent = responseData.data.oppositeUser.company.companyName;
                        document.getElementById('counterpartyName').textContent = responseData.data.oppositeUser.firstName + " " + responseData.data.oppositeUser.lastName;
                        if (documentMode != 'markup') {
                            getContractTeamAndUserList();
                        }
                        getContractSectionList();
                    } else if ((responseData.data.openContractDetails && responseData.data.openContractDetails.counterPartyInviteStatus && responseData.data.openContractDetails.counterPartyInviteStatus == 'Pending') || responseData.data.counterPartyInviteStatus == 'Pending') {
                        document.getElementById('divInviteCounterparty').classList.remove(displayNoneClass);
                    }
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Get contract team and user list for clause create form
     */
    function getContractTeamAndUserList() {
        const getContractTeamAndUserListUrl = apiBaseUrl + '/meeting/getContractTeamAndUserList/' + documentID;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'GET',
            headers: headers,
        };
        fetch(getContractTeamAndUserListUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                const responseData = data;
                if (responseData && responseData.data) {
                    var teamLists = responseData.data.filter((ele) => {
                        return ele.type == "team";
                    });
                    var userLists = responseData.data.filter((ele) => {
                        return ele.type == "user" && ele.role !== "Contract Creator";
                    });
                    if (teamLists.length > 0) {
                        inviteTeamListIDs = teamLists;
                        var teamsNoteFoundMessage = document.getElementById('teamsNoteFoundMessage');
                        if (teamsNoteFoundMessage) {
                            teamsNoteFoundMessage.classList.add(displayNoneClass);
                        }
                        var inviteteams = document.getElementById('inviteteams');
                        if (inviteteams) {
                            inviteteams.classList.remove(displayNoneClass);
                        }
                        var html = '';
                        html += '<div class="filter-inner">\n';
                        html += '<ul>\n';
                        teamLists.forEach((ele) => {
                            html += '<li>\n' +
                                '<div class="form-check" data-id="' + ele.itemId + '" data-json="' + JSON.stringify(ele) + '">\n' +
                                '<input type="checkbox" id="inviteteam_' + ele.itemId + '" class="form-check-input team-chkbox" />' +
                                '<label for="inviteteam_' + ele.itemId + '" class="form-check-label">\n' +
                                '<div class="invite-users-inner-bar">\n' +
                                '<div class="invite-users-name">\n' +
                                '<strong>' + ele.itemName + '</strong>\n' +
                                '</div>\n' +
                                '</div>\n' +
                                '</label>\n' +
                                '</div>\n' +
                                '</li>\n';
                        });
                        html += '</ul>\n';
                        html += '</div>';
                        //accordionBodyTeams
                        document.getElementById('accordionBodyTeams').innerHTML = html;
                    }
                    if (userLists.length > 0) {
                        inviteUserListIDs = userLists;
                        var usersNoteFoundMessage = document.getElementById('usersNoteFoundMessage');
                        if (usersNoteFoundMessage) {
                            usersNoteFoundMessage.classList.add(displayNoneClass);
                        }
                        var inviteusers = document.getElementById('inviteusers');
                        if (inviteusers) {
                            inviteusers.classList.remove(displayNoneClass);
                        }
                        var html = '';
                        html += '<div class="filter-inner">';
                        html += '<ul>';
                        // ' + IMAGE_USER_PATH_LINK + ele.userImage + '
                        // assets/images/no-profile-image.jpg
                        userLists.forEach((ele) => {
                            html += '<li>';
                            html += '<div class="form-check" data-id="' + ele.itemId + '" data-json="' + JSON.stringify(ele) + '">\n' +
                                '\t<input type="checkbox" id="inviteuser_' + ele.itemId + '" class="form-check-input user-chkbox" value="' + ele.itemId + '">\n' +
                                '\t<label for="inviteuser_' + ele.itemId + '" class="form-check-label">\n' +
                                '\t\t<div class="conversation-left">\n' +
                                '\t\t\t<span class="user-icon" id="userProfileImage">\n' +
                                '\t\t\t\t<img src="' + (ele.userImage ? IMAGE_USER_PATH_LINK + ele.userImage : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                '\t\t\t</span>\n' +
                                '\t\t\t<div class="user-inner">\n' +
                                '\t\t\t\t<span class="user-name" id="userProfileName">' + ele.itemName + '</span>\n' +
                                '\t\t\t\t<p id="userProfilerole">' + ele.role + '</p>\n' +
                                '\t\t\t</div>\n' +
                                '\t\t</div>\n' +
                                '\t</label>\n' +
                                '</div>';
                            html += '</li>';
                        });
                        html += '</ul>';
                        html += '</div>';
                        document.getElementById('accordionBodyUsers').innerHTML = html;
                    }
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Get list of contract sections
     */
    function getContractSectionList() {
        let getContractSectionListUrl = apiBaseUrl + '/contractSection/getSelectedStatusContractSection/all/' + documentID;
        //?filter[description]=Test&sort[createdAt]=-1&page=1&limit=6
        getContractSectionListUrl += '?';
        let queryParam = [];
        // Search text
        if (searchText) {
            queryParam.push('filter[search_text]=' + searchText);
        }
        // Set sortby created time
        queryParam.push('sort[createdAt]=-1');
        // Set pageSize
        queryParam.push('page=' + clauseNextPage);
        // Set recordLimit
        queryParam.push('limit=' + clauseRecordLimit);
        // Set queryparams
        getContractSectionListUrl += queryParam.join('&');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'GET',
            headers: headers,
        };
        fetch(getContractSectionListUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                const responseData = data;
                if (responseData && responseData.data) {
                    const resData = responseData.data;
                    // document.getElementById('contractListItemsDiv').innerHTML = '';
                    if (resData.data.length > 0) {
                        clauseHasNextPage = resData.hasNextPage;
                        clauseNextPage = resData.nextPage;
                        var result = resData.data;
                        var html = '';
                        var html1 = '';
                        result.forEach((ele) => {
                            html += '<div class="contract-item">\n' +
                                '\t\t\t<a href="#">\n' +
                                '\t\t\t\t\t\t<div class="contract-top">\n' +
                                '\t\t\t\t\t\t\t\t\t<h3>' + ele.contractSection + '</h3>\n' +
                                '\t\t\t\t\t\t\t\t\t<p>' + ele.contractDescription + '</p>\n';
                            let contractStatusColorCode = 'active-color';
                            if (ele.contractStatus == 'Drafting') {
                                contractStatusColorCode = 'fuchsia-color';
                            } else if (ele.contractStatus == 'Under Negotiation') {
                                contractStatusColorCode = 'blue-color';
                            } else if (ele.contractStatus == 'Agreed Position') {
                                contractStatusColorCode = 'dark-green-color';
                            } else if (ele.contractStatus == 'Under Revision') {
                                contractStatusColorCode = 'brown-color';
                            } else if (ele.contractStatus == 'Requires Discussion') {
                                contractStatusColorCode = 'invited-color';
                            } else if (ele.contractStatus == 'Completed') {
                                contractStatusColorCode = 'success-color';
                            }
                            html += '\t\t\t\t\t\t\t\t\t<button class="btn ' + contractStatusColorCode + '">' + ele.contractStatus + '</button>\n';

                            html += '\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t<div class="contract-foot">\n' +
                                '\t\t\t\t\t\t\t\t\t<div class="contract-foot-inner">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-foot-item">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<h3>Created by</h3>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-user">\n';

                            html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img src="' + (ele && ele.createdByUserDetails && ele.createdByUserDetails.imageUrl ? ele.createdByUserDetails.imageUrl : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>' + (ele && ele.createdByUserDetails ? ele.createdByUserDetails.firstName + ' ' + ele.createdByUserDetails.lastName : '') + '</span>\n';

                            html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-foot-item">\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<h3>Requires action by</h3>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-user">\n';

                            if (ele && ele.approvedByUserDetails && ele.approvedByUserDetails.length > 0) {
                                ele.approvedByUserDetails.forEach((element) => {
                                    html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<img src="' + (element && element.userInfo && ele.userInfo?.imageUrl ? ele.userInfo?.imageUrl : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                        '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>' + (element && element.userInfo ? element.userInfo.firstName + ' ' + element.userInfo.lastName : '') + '</span>\n';
                                });
                            } else {
                                html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>&mdash;</span>\n';
                            }

                            html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t\t\t\t</div>\n' +
                                '\t\t\t\t\t\t</div>\n' +
                                '\t\t\t</a>\n' +
                                '</div>';
                        });
                        document.getElementById('contractListItemsDiv').innerHTML += html;
                    }
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Invite the counterparty
     */
    function inviteCounterparties() {
        var form = document.getElementById('inviteForm');
        var data = JSON.stringify({
            firstName: form.elements['firstName'].value,
            lastName: form.elements['lastName'].value,
            email: form.elements['email'].value,
            organizationName: form.elements['organisationName'].value
        });
        const inviteCounterpartiesUrl = apiBaseUrl + '/contract/inviteCounterPartyUser/' + documentID;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: data
        };
        fetch(inviteCounterpartiesUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                document.getElementById("inviteForm").reset();
                const responseData = data;
                if (responseData && responseData.status == true && responseData.code == 200) {
                    document.getElementById('divInviteCounterpartyPending').classList.remove(displayNoneClass);
                    document.getElementById('divInviteCounterpartyForm').classList.add(displayNoneClass);
                    if (responseData.data && responseData.data._id) {
                        document.getElementById('organizationName').textContent = responseData.data.organizationName;
                        document.getElementById('counterpartyName').textContent = responseData.data.firstName + " " + responseData.data.lastName;
                    } else {
                        getOpenContractUserDetails();
                    }
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Cancel the counterparty invitation
     */
    function cancelInvitation() {
        const cancelInvitationsUrl = apiBaseUrl + '/contract/cancelInvitationEmail/' + documentID;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'GET',
            headers: headers,
        };
        fetch(cancelInvitationsUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                console.log(data);
                const responseData = data;
                if (responseData && responseData.status == true && responseData.code == 200) {
                    document.getElementById('divInviteCounterpartyPending').classList.add(displayNoneClass);
                    document.getElementById('divInviteCounterparty').classList.remove(displayNoneClass);
                } else {

                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Resend counterparty invitation
     */
    function resendCounterpartyInvitation() {
        const resendCounterpartyInvitationUrl = apiBaseUrl + '/contract/resendInvitationEmail/' + documentID;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'GET',
            headers: headers,
        };
        fetch(resendCounterpartyInvitationUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                console.log(data);
                const responseData = data;
                if (responseData && responseData.status == true && responseData.code == 200) {
                    console.log(responseData.message);
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }

    /**
     * @desc Create clause section
     */
    function createClauseSection() {
        var randomNumber = Math.floor(Math.random() * (1000000 - 1 + 1)) + 1;
        var commentID = Date.now() + '-' + randomNumber;
        var form = document.getElementById('clauseForm');
        var data = JSON.stringify({
            contractId: documentID,
            contractSection: form.elements['contractSection'].value,
            contractDescription: form.elements['contractDescription'].value,
            assignedTeamAndUserDetails: [...selectedInvitedTeams, ...selectedInvitedUsers],
            commentId: commentID
        });
        const createClauseSectionUrl = apiBaseUrl + '/contractSection/createNewContractSection';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        };
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: data
        };
        fetch(createClauseSectionUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                // Handle the response data
                document.getElementById("clauseForm").reset();
                const responseData = data;
                if (responseData && responseData.status == true && responseData.code == 200) {
                    var sDocumentEditingRestrictions = "none";
                    window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                    var nContentControlType = 2;
                    color = {
                        R: 104,
                        G: 215,
                        B: 248,
                    };
                    nContentControlProperties = {
                        "Id": randomNumber,
                        "Tag": commentID,
                        "Lock": 1,
                        "Color": color,
                        "InternalId": randomNumber.toString()
                    };
                    console.log('nContentControlProperties', nContentControlProperties);
                    window.Asc.plugin.executeMethod("AddContentControl", [nContentControlType, nContentControlProperties]);
                    var sDocumentEditingRestrictions = "readOnly";
                    window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                    document.getElementById('divContractChatHistory').classList.remove(displayNoneClass);
                    document.getElementById('divContractCreate').classList.add(displayNoneClass);
                }
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });
    }
    /**====================== API Function End ======================*/



    // /********************* Plugin Init - End CM *********************/ //

})(window, undefined);