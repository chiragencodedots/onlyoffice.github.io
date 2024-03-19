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

    /**
     * @constant
     * @description Define the variables for HTML show/hide & enabled/disabled
     */
    var displayNoneClass = "d-none";
    var disabledClass = "disabled";
    var displayedInvitecpPending = "displayed-invitecp-pending";
    var displayedInviteCP = "displayed-invitecp";

    /**
     * @constant
     * @description Define the Path
     */
    var baseUrl = 'http://localhost:3003';
    var apiBaseUrl = baseUrl + '/api/v1/app';
    var IMAGE_USER_PATH_LINK = 'https://propact.s3.amazonaws.com/';

    /**
     * @constant
     * @description Defined the variables related to contract
     */
    var authToken = '';
    var contractID = '';
    var contractMode = '';
    var splitArray;
    var documentCallbackUrl = '';

    /**
     * @constant
     * @description Define the variables for plugin setting
     */
    var flagInit = false;
    var flagDisableWhenPluginLoading = false;
    var flagSocketInit = false;
    var flagRedirectFirst = false;

    /**
     * @constant
     * @description Defined the variables related to clause lists
     */
    var openContractResponseData = {};
    var contractInformation = {};
    var loggedInUserDetails;
    var counterPartyDetail;
    var counterPartyCompanyDetail;
    var tagLists = [];
    var selectedClauseID = '';
    var selectedInviteTeams = [];
    var selectedInviteUsers = [];
    var searchText = '';
    var searchTimeout;
    var clauseNextPage = 1;
    var clauseHasNextPage = true;
    var clauseLists = [];
    var sectionID = '';

    /**
     * @constant
     * @description Define the variables for socket functionality
     */
    var socket = '';


    /**
     * @constant
     * @type {{loader: HTMLElement, error: HTMLElement, libLoader: HTMLElement}}
     * @description Defined all the HTML element
     */
    var elements = {
        loader: document.getElementById("loader"),

        btnCreateClause: document.getElementById("btnCreateClause"),
        btnMarkupMode: document.getElementById("btnMarkupMode"),
        btnInviteCounterparty: document.getElementById("btnInviteCounterparty"),
        btnInviteCounterpartyCancel: document.getElementById("btnInviteCounterpartyCancel"),
        btnResendInvitation: document.getElementById("btnResendInvitation"),
        btnCancelInvitation: document.getElementById("btnCancelInvitation"),
        btnScrollDown: document.getElementById("btnScrollDown"),
        btnContractCreateClose: document.getElementById("btnContractCreateClose"),
        btnContractCreateCancel: document.getElementById("btnContractCreateCancel"),

        paragraphInvitationActions: document.getElementById("paragraphInvitationActions"),
        paragraphTeamsNotFoundMessage: document.getElementById("paragraphTeamsNotFoundMessage"),
        paragraphUsersNotFoundMessage: document.getElementById("paragraphUsersNotFoundMessage"),

        formInviteCounterparty: document.getElementById("formInviteCounterparty"),
        formClause: document.getElementById("formClause"),

        sectionContractLists: document.getElementById("sectionContractLists"),
        sectionInviteCounterparty: document.getElementById("sectionInviteCounterparty"),
        sectionCreateClause: document.getElementById("sectionCreateClause"),

        divInviteCounterparty: document.getElementById("divInviteCounterparty"),
        divContractListItems: document.getElementById("divContractListItems"),
        divInviteCounterpartyInvited: document.getElementById("divInviteCounterpartyInvited"),
        divInviteUsersBox: document.getElementById("divInviteUsersBox"),

        txtOrganizationName: document.getElementById("txtOrganizationName"),
        txtCounterpartyName: document.getElementById("txtCounterpartyName"),
        txtCounterpartyEmail: document.getElementById("txtCounterpartyEmail"),

        inputInviteUsersTeams: document.getElementById("inputInviteUsersTeams"),
        chkboxInviteAllTeams: document.getElementById("chkboxInviteAllTeams"),
        chkboxInviteAllUsers: document.getElementById("chkboxInviteAllUsers"),
        inputSearchbox: document.getElementById("inputSearchbox"),

        accordionBodyTeams: document.getElementById("accordionBodyTeams"),
        accordionBodyUsers: document.getElementById("accordionBodyUsers"),

        snackbar: document.getElementById("snackbar"),
    }

    /**================================== Plugin Init Start ===============================*/
    window.Asc.plugin.init = function (text) {
        // debugger;
        //event "init" for plugin
        // window.Asc.plugin.executeMethod("ShowButton", ["back", false]);
        // window.Asc.plugin.executeMethod("GetAllContentControls");

        if (window.Asc.plugin.info && typeof window.Asc.plugin.info.documentCallbackUrl == 'string') {
            documentCallbackUrl = window.Asc.plugin.info.documentCallbackUrl;
        } else {
            documentCallbackUrl = "http://localhost:3003/api/v1/app/contract/track/65e1619244539624590d1516/65dec1ed13116f663672c94d/edit/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWRlYzFlZDEzMTE2ZjY2MzY3MmM5NGIiLCJjb21wYW55SWQiOiI2NWRlYzFlZDEzMTE2ZjY2MzY3MmM5NGQiLCJjb21wYW55TmFtZSI6IkFCQyIsInVzZXJSb2xlIjoiQWRtaW4iLCJmaXJzdE5hbWUiOiJNaXJhbGkiLCJsYXN0TmFtZSI6IkNoYXVoYW4iLCJlbWFpbCI6Im1pcmFsaS5lbmNvZGVkb3RzQGdtYWlsLmNvbSIsImltYWdlS2V5IjoiYXBwL3Byb2ZpbGUvSUVKSFcyMDI0MDMwMTA0NDIwMy5wbmciLCJzdHJpcGVDdXN0b21lcklkIjoiY3VzX1Blbng4UkhibFlJamZmIiwidG9rZW5Gb3IiOiJhcHAiLCJpYXQiOjE3MTA0ODQ5ODEsImV4cCI6MTcxMzA3Njk4MX0.s0S4TmlVP8fAYdXSdvwTuHGpuw94IzqmYE4P3vvkoCk/0/0";
        }

        /**====================== Get & Set variables ======================*/
        contractID = getContractID(documentCallbackUrl);
        contractMode = getContractMode(documentCallbackUrl);
        splitArray = documentCallbackUrl.split('/');
        authToken = splitArray[11];
        if (splitArray.length >= 13 && splitArray[12] != '0') {
            sectionID = splitArray[12];
        }
        if (splitArray.length >= 14 && splitArray[13] != '0') {
            chatWindows = splitArray[13];
        }
        /**====================== Get & Set variables ======================*/

        if (!flagSocketInit) {
            socket = io.connect(baseUrl,
                {auth: {authToken}}
            );
            console.log('socket', socket);
            flagSocketInit = true;
        }

        /**
         * @desc If text is not selected or contract is in markup mode than disable the create clause button
         */
        if (contractMode == 'markup') {
            switchClass(elements.btnCreateClause, displayNoneClass, true);
            elements.btnMarkupMode.innerHTML = 'Back to Contract';
        } else {
            switchClass(elements.btnCreateClause, displayNoneClass, false);
            switchClass(elements.btnCreateClause, disabledClass, true);
            elements.btnMarkupMode.innerHTML = 'Select Markup Mode';
            // $('#clauseText').val(text);
            if (text) {
                switchClass(elements.btnCreateClause, disabledClass, false);
            } else {
                if (!document.getElementById('btnCreateClause').classList.contains(disabledClass)) {
                    switchClass(elements.btnCreateClause, disabledClass, true);
                }
                /*if (!document.getElementById('divContractCreate').classList.contains(displayNoneClass)) {
                    document.getElementById('divContractCreate').classList.add(displayNoneClass);
                    document.getElementById('divContractLists').classList.remove(displayNoneClass);
                }*/
            }
            if (!flagDisableWhenPluginLoading) {
                if (typeof window.Asc.plugin.executeMethod === 'function') {
                    var sDocumentEditingRestrictions = "readOnly";
                    window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                }
                flagDisableWhenPluginLoading = true;
            }
        }

        /**
         * @desc Get the open contract and user details
         */
        if (contractID && authToken && !flagInit) {
            getContractDetails(socket);
        }

    }
    /**================================== Plugin Init End =================================*/

    if (window.Asc.plugin.info && typeof window.Asc.plugin.info.documentCallbackUrl == 'string') {
        documentCallbackUrl = window.Asc.plugin.info.documentCallbackUrl;
    } else {
        documentCallbackUrl = "http://localhost:3003/api/v1/app/contract/track/65f9436f80a3712308633a2d/65dec1ed13116f663672c94d/edit/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWRlYzFlZDEzMTE2ZjY2MzY3MmM5NGIiLCJjb21wYW55SWQiOiI2NWRlYzFlZDEzMTE2ZjY2MzY3MmM5NGQiLCJjb21wYW55TmFtZSI6IkFCQyIsInVzZXJSb2xlIjoiQWRtaW4iLCJmaXJzdE5hbWUiOiJNaXJhbGkiLCJsYXN0TmFtZSI6IkNoYXVoYW4iLCJlbWFpbCI6Im1pcmFsaS5lbmNvZGVkb3RzQGdtYWlsLmNvbSIsImltYWdlS2V5IjoiYXBwL3Byb2ZpbGUvSUVKSFcyMDI0MDMwMTA0NDIwMy5wbmciLCJzdHJpcGVDdXN0b21lcklkIjoiY3VzX1Blbng4UkhibFlJamZmIiwidG9rZW5Gb3IiOiJhcHAiLCJpYXQiOjE3MTA3NTY1MDcsImV4cCI6MTcxMzM0ODUwN30.yZKyqgd4viJ9dE6bNnvCVfF1PRsZyXAV0uF1A2TcOFA/0/0";
    }

    /**====================== Get & Set variables ======================*/
    contractID = getContractID(documentCallbackUrl);
    contractMode = getContractMode(documentCallbackUrl);
    splitArray = documentCallbackUrl.split('/');
    authToken = splitArray[11];
    if (splitArray.length >= 13 && splitArray[12] != '0') {
        sectionID = splitArray[12];
    }
    if (splitArray.length >= 14 && splitArray[13] != '0') {
        chatWindows = splitArray[13];
    }
    /**====================== Get & Set variables ======================*/

    if (!flagSocketInit) {
        socket = io.connect(baseUrl,
            {auth: {authToken}}
        );
        console.log('socket', socket);
        flagSocketInit = true;
    }

    /**
     * @desc Get the open contract and user details
     */
    if (contractID && authToken && !flagInit) {
        getContractDetails(socket);
    }

    /**====================== Section: Invite Counterparty ======================*/
    $("#formInviteCounterparty").validate({
        submitHandler: function (form) {
            switchClass(elements.loader, displayNoneClass, false);
            inviteCounterparties();
        }
    });

    elements.btnInviteCounterpartyCancel.onclick = function () {
        $("#formInviteCounterparty").validate().resetForm();
        elements.formInviteCounterparty.reset();
        switchClass(elements.sectionContractLists, displayNoneClass, false);
        switchClass(elements.sectionInviteCounterparty, displayNoneClass, true);
    }
    /**====================== Section: Invite Counterparty ======================*/

    /**====================== Section: Contract Lists ======================*/
    elements.btnCreateClause.onclick = function () {
        // alert('Button Clicked: Select Markup Mode');
        if (!elements.divInviteUsersBox.classList.contains(displayNoneClass)) {
            switchClass(elements.divInviteUsersBox, displayNoneClass, true);
        }
        // if (text) {
        switchClass(elements.sectionContractLists, displayNoneClass, true);
        switchClass(elements.sectionCreateClause, displayNoneClass, false);
        // }
    };

    elements.btnMarkupMode.onclick = function () {
        var data = {
            chatRoomName: loggedInUserDetails._id + "_" + contractID,
            contractMode: contractMode == 'markup' ? 'edit' : 'markup'
        }
        socket.emit('switchContractMode', data);
    };

    elements.btnInviteCounterparty.onclick = function () {
        switchClass(elements.sectionContractLists, displayNoneClass, true);
        switchClass(elements.sectionInviteCounterparty, displayNoneClass, false);
    };

    elements.btnResendInvitation.onclick = function () {
        switchClass(elements.loader, displayNoneClass, false);
        resendInvitation();
    }

    elements.btnCancelInvitation.onclick = function () {
        switchClass(elements.loader, displayNoneClass, false);
        cancelInvitation();
    }

    elements.inputSearchbox.onkeyup = function (event) {
        clearTimeout(searchTimeout); // Clear any existing timeout
        searchTimeout = setTimeout(async function () {
            if (searchText != event.target.value.trim()) {
                elements.divContractListItems.innerHTML = '';
                searchText = event.target.value.trim();
                clauseNextPage = 1;
                clauseHasNextPage = true;
                clauseLists = [];
                await getClauses();
            } else {
                searchText = '';
                clauseNextPage = 1;
                clauseHasNextPage = true;
                clauseLists = [];
                await getClauses();
            }
        }, 500);
    }

    // Clause Lazyload functionality
    elements.divContractListItems.onscroll = async function (e) {
        if (elements.divContractListItems.scrollTop + elements.divContractListItems.offsetHeight >= (elements.divContractListItems.scrollHeight - 1)) {
            if (clauseHasNextPage) {
                await getClauses();
            } else {
                switchClass(elements.btnScrollDown, displayNoneClass, true);
            }
        } else {
            if (elements.divContractListItems.scrollHeight >= elements.divContractListItems.scrollTop + elements.divContractListItems.offsetHeight && clauseLists && clauseLists.length > 2) {
                switchClass(elements.btnScrollDown, displayNoneClass, false);
            } else {
                switchClass(elements.btnScrollDown, displayNoneClass, true);
            }
        }
    };

    elements.btnScrollDown.onclick = function () {
        $('#divContractListItems').animate({scrollTop: elements.divContractListItems.scrollHeight}, 'slow');
        return false;
    }
    /**====================== Section: Contract Lists ======================*/


    /**====================== Section: Create Clause ======================*/
    $("#formClause").validate({
        ignore: "",
        rules: {
            clauseText: {
                required: true
            }
        },
        messages: {
            clauseText: {
                required: "Please select the text from the document"
            }
        },
        errorClass: "error", // CSS class for error messages
        errorPlacement: function (error, element) {
            error.insertAfter(element); // Place error messages after the element
        },
        submitHandler: function (form) {
            createClauseSection(socket);
        }
    });

    elements.btnContractCreateClose.onclick = function () {
        redirectToClauseList();
    };

    elements.btnContractCreateCancel.onclick = function () {
        redirectToClauseList();
    };

    elements.inputInviteUsersTeams.onclick = function () {
        if (!elements.divInviteUsersBox.classList.contains(displayNoneClass)) {
            switchClass(elements.divInviteUsersBox, displayNoneClass, true);
        } else {
            switchClass(elements.divInviteUsersBox, displayNoneClass, false);
        }
    };

    elements.chkboxInviteAllTeams.onclick = function (event) {
        $('.team-chkbox').prop('checked', this.checked);
        updateInviteCheckbox();
        event.stopPropagation();
    };

    elements.chkboxInviteAllUsers.onclick = function (event) {
        $('.user-chkbox').prop('checked', this.checked);
        updateInviteCheckbox();
        event.stopPropagation();
    };

    $(document).on('click', '.team-chkbox', function () {
        var allChecked = $('.team-chkbox:checked').length === $('.team-chkbox').length;
        $('#chkboxInviteAllTeams').prop('checked', allChecked);
        updateInviteCheckbox();
    });

    $(document).on('click', '.user-chkbox', function () {
        var allChecked = $('.user-chkbox:checked').length === $('.user-chkbox').length;
        $('#chkboxInviteAllUsers').prop('checked', allChecked);
        updateInviteCheckbox();
    });
    /**====================== Section: Create Clause ======================*/


    /**================== Other Function Start ========================*/
    /**
     * @description This function will be used for the get contract id from callback url
     * @param url
     * @returns {*|string}
     */
    function getContractID(url) {
        var urlArr = url.split('/');
        return urlArr[8];
    }

    /**
     * @description This function will be used for the get contract mode from callback url
     * @param url
     * @returns {*|string}
     */
    function getContractMode(url) {
        var urlArr = url.split('/');
        return urlArr[10];
    }

    /**
     * @description Switch classes
     * @param el
     * @param className
     * @param add
     */
    function switchClass(el, className, add) {
        if (add) {
            el.classList.add(className);
        } else {
            el.classList.remove(className);
        }
    }

    /**
     * @description This function will be used for redirect to clause list page from create clause
     */
    function redirectToClauseList() {
        $("#formClause").validate().resetForm();
        elements.formClause.reset();
        if ($('#inviteteams').prop('checked')) {
            $('#inviteteams').click();
        }
        if ($('#inviteusers').prop('checked')) {
            $('#inviteusers').click();
        }
        var placeholderText = 'Select users and teams';
        elements.inputInviteUsersTeams.placeholder = placeholderText;
        $('#inputInviteUsersTeams').click();
        $('#collapseTeams, #collapseUsers').collapse('hide');
        switchClass(elements.sectionCreateClause, displayNoneClass, true);
        switchClass(elements.sectionContractLists, displayNoneClass, false);
    }

    /**
     * Update invite team checkbox
     */
    function updateInviteCheckbox() {
        $('.team-chkbox').each(function () {
            var isChecked = $(this).prop("checked");
            var dataID = $(this).parent().data('id');
            var jsonData = inviteTeamListIDs.find((ele) => ele.itemId == dataID);
            if (isChecked) {
                if (selectedInviteTeams.findIndex((ele) => ele.itemId == jsonData.itemId) < 0) {
                    selectedInviteTeams.push(jsonData);
                }
            } else {
                if (selectedInviteTeams.findIndex((ele) => ele.itemId == jsonData.itemId) > -1) {
                    selectedInviteTeams = $.grep(selectedInviteTeams, function (value) {
                        return value.itemId != dataID;
                    });
                }
            }
        });
        $('.user-chkbox').each(function () {
            var isChecked = $(this).prop("checked");
            var dataID = $(this).parent().data('id');
            var jsonData = inviteUserListIDs.find((ele) => ele.itemId == dataID);
            if (isChecked) {
                if (selectedInviteUsers.findIndex((ele) => ele.itemId == jsonData.itemId) < 0) {
                    selectedInviteUsers.push(jsonData);
                }
            } else {
                if (selectedInviteUsers.findIndex((ele) => ele.itemId == jsonData.itemId) > -1) {
                    selectedInviteUsers = $.grep(selectedInviteUsers, function (value) {
                        return value.itemId != dataID;
                    });
                }
            }
        });
        updateInvitePlacehoder();
    }

    /**
     * @desc Update the placeholder of Invite user input
     */
    function updateInvitePlacehoder() {
        var placeholderText = 'Select users and teams';
        var placeholderTextArray = [];
        if (selectedInviteUsers && selectedInviteUsers.length > 0) {
            placeholderTextArray.push(selectedInviteUsers.length + (selectedInviteUsers.length == 1 ? ' User' : ' Users'));
        }
        if (selectedInviteTeams && selectedInviteTeams.length > 0) {
            placeholderTextArray.push(selectedInviteTeams.length + (selectedInviteTeams.length == 1 ? ' Team' : ' Teams'));
        }
        if (placeholderTextArray.length > 0) {
            placeholderText = placeholderTextArray.join(' and ') + ' Selected';
        }
        elements.inputInviteUsersTeams.placeholder = placeholderText;
    }

    /**================== Other Function End  =========================*/


    /**================== API Start  =========================*/
    /**
     * @description This function will used for get the contract details and did the initial view settings of the plugin after getting the response
     * @param socket
     * @param redirection
     */
    function getContractDetails(socket, redirection = true) {
        try {
            let requestURL = apiBaseUrl + '/contract/get-open-contract-detail/' + contractID;
            var headers = {
                "Content-Type": "application/json"
            };
            if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
            fetch(requestURL, {headers: headers})
                .then(response => response.json())
                .then(res => {
                    var response = res;
                    if (response && response.status == true && response.code == 200 && response.data) {
                        var responseData = res.data;
                        var openContractResponseData = responseData;
                        var contractInformation = responseData.openContractDetails;
                        loggedInUserDetails = responseData.loggedInUserDetails;
                        if (contractInformation.counterPartyInviteStatus !== 'Pending') {
                            counterPartyDetail = responseData.oppositeUser;
                        }
                        if (contractInformation.counterPartyInviteStatus == 'Accepted') {
                            counterPartyCompanyDetail = responseData.oppositeCompanyDetails;
                            if (contractMode !== 'markup') {
                                if (typeof window.Asc.plugin.executeMethod === 'function') {
                                    var sDocumentEditingRestrictions = "readOnly";
                                    window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                                }
                            }
                        }
                        if (contractInformation.userWhoHasEditAccess && contractInformation.userWhoHasEditAccess == loggedInUserDetails._id && responseData.contractCurrentState == 'Edit') {
                            if (typeof window.Asc.plugin.executeMethod === 'function') {
                                var sDocumentEditingRestrictions = "none";
                                window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                            }
                        }
                        var flagInit = true;
                        if (selectedClauseID) {
                            // TODO: Set tooltip based on loggedin user roles
                            /*var getClauseDetails = clauseLists.find((ele) => ele._id == selectedClauseID);
                            if (contractInformation && responseData.canSendPositionConfirmation && getClauseDetails && getClauseDetails.isSectionInDraftMode) {
                                if (contractInformation.userWhoHasEditAccess == loggedInUserDetails._id || responseData.userRole == "Counterparty" || responseData.userRole == "Contract Creator" || responseData.userRole == "Admin") {
                                    document.getElementById('toggleSendPositionConfirmationA').setAttribute('title', 'Send for Draft Confirmation');
                                } else {
                                    document.getElementById('toggleSendPositionConfirmationA').setAttribute('title', 'Send for Position Confirmation');
                                }
                            } else {
                                document.getElementById('toggleSendPositionConfirmationA').setAttribute('title', 'Send for Position Confirmation');
                            }*/
                        } else {
                            // TODO: Set tooltip based on loggedin user roles
                            // document.getElementById('toggleSendPositionConfirmationA').setAttribute('title', 'Send for Position Confirmation');
                        }
                        document.title = "ProPact | " + loggedInUserDetails.firstName + " " + loggedInUserDetails.lastName + " " + responseData.userRole;
                        if (loggedInUserDetails) {
                            // TODO: Set logged in user images in details screen
                            // set logged-in user profile picture
                            $('.loggedin-user-profile').each(function () {
                                $(this).attr('src', (loggedInUserDetails.imageKey ? IMAGE_USER_PATH_LINK + loggedInUserDetails.imageKey : 'images/no-profile-image.jpg'));
                            });
                            // set logged-in user name
                            $('.loggedin-user-name').text(loggedInUserDetails.firstName + " " + loggedInUserDetails.lastName);
                            // set logged-in user role
                            $('.loggedin-user-role').text(responseData.userRole);
                            // document.getElementById('userProfileImageA').src = responseData.data.loggedInUserDetails.imageUrl ? responseData.data.loggedInUserDetails.imageUrl : 'images/no-profile-image.jpg';
                            // document.getElementById('userProfileNameA').innerHTML = responseData.data.loggedInUserDetails.firstName + " " + responseData.data.loggedInUserDetails.lastName + '<img src="images/icon-info.png" class="img-info">';
                            // document.getElementById('userProfileroleA').textContent = responseData.data.loggedInUserDetails.role;
                        }

                        if (contractMode != 'markup') {
                            getContractTeamAndUserList();
                        }
                        if (redirection) {
                            switchClass(elements.btnMarkupMode, displayNoneClass, true);
                            switchClass(elements.btnMarkupMode.parentElement, 'justify-content-end', true);
                            // document.getElementById('divContractLists').classList.remove(displayNoneClass);
                            clauseNextPage = 1;
                            clauseHasNextPage = true;
                            clauseLists = [];
                            getClauses();
                        }

                        if (contractInformation.counterPartyInviteStatus == 'Accepted') {
                            switchClass(elements.divInviteCounterparty, displayNoneClass, true);
                        } else if (contractInformation.counterPartyInviteStatus == 'Invited') {
                            if (!(responseData.userRole == 'Admin' || responseData.userRole == 'Contract Creator')) {
                                switchClass(elements.paragraphInvitationActions, displayNoneClass, true);
                            }
                            switchClass(elements.divInviteCounterparty, displayNoneClass, true);
                            switchClass(elements.divInviteCounterpartyInvited, displayNoneClass, false);
                            switchClass(elements.divContractListItems, displayedInviteCP, true);
                            switchClass(elements.divContractListItems, displayedInvitecpPending, false);
                            elements.txtOrganizationName.textContent = contractInformation.invitedOrgName;
                            elements.txtCounterpartyName.textContent = counterPartyDetail.firstName + " " + counterPartyDetail.lastName + " - Counterparty";
                            elements.txtCounterpartyEmail.textContent = counterPartyDetail.email;
                            // TODO: Get list of clause logic pending and button show/hide pending - Remove Later
                            /*if (redirection) {
                                switchClass(elements.btnMarkupMode, displayNoneClass, true);
                                switchClass(elements.btnMarkupMode.parentElement, 'justify-content-end', true);
                                // document.getElementById('divContractLists').classList.remove(displayNoneClass);
                                // if (documentMode != 'markup') {
                                //     getContractTeamAndUserList();
                                // }
                                // clauseNextPage = 1;
                                // clauseHasNextPage = true;
                                // clauseLists = [];
                                // getContractSectionList();
                            }*/
                            // document.getElementById('btnGoToCounterparty').classList.add(displayNoneClass);
                            // document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
                            // $('#chatFooterInner').addClass('justify-content-end');
                        } else if (contractInformation.counterPartyInviteStatus == 'Pending') {
                            switchClass(elements.divInviteCounterparty, displayNoneClass, false);
                            switchClass(elements.divContractListItems, displayedInviteCP, true);
                            switchClass(elements.divContractListItems, displayedInvitecpPending, false);
                            if (!(responseData.userRole == 'Admin' || responseData.userRole == 'Contract Creator')) {
                                switchClass(elements.btnInviteCounterparty, disabledClass, true);
                            }
                            // TODO: Counterparty button show/hide and other logic's needed here - Remove later
                            /*document.getElementById('btnGoToCounterparty').classList.add(displayNoneClass);
                            document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
                            $('#chatFooterInner').addClass('justify-content-end');
                            if (documentMode != 'markup') {
                                getContractTeamAndUserList();
                            }
                            if (redirection) {
                                switchClass(elements.btnMarkupMode, displayNoneClass, true);
                                switchClass(elements.btnMarkupMode.parentElement, 'justify-content-end', true);
                                /!*document.getElementById('divContractLists').classList.remove(displayNoneClass);
                                if (documentMode != 'markup') {
                                    getContractTeamAndUserList();
                                }
                                clauseNextPage = 1;
                                clauseHasNextPage = true;
                                clauseLists = [];
                                getContractSectionList();*!/
                            }*/
                        }
                    } else {
                        console.log('Error: 14031200', 'Contract details not found');
                    }
                })
                .catch(function (err) {
                    console.log('Error #14031301:', err);
                });
        } catch (error) {
            console.log('Error #14031431:', error);
        }
    }

    /**
     * @description This function will used for send the invitation to join the contract as counterparty
     */
    function inviteCounterparties() {
        var form = elements.formInviteCounterparty;

        const urlencoded = new URLSearchParams();
        urlencoded.append("contractId", contractID);
        urlencoded.append("firstName", form.elements['firstName'].value);
        urlencoded.append("lastName", form.elements['lastName'].value);
        urlencoded.append("email", form.elements['email'].value);
        urlencoded.append("organisationName", form.elements['organisationName'].value);

        let requestURL = apiBaseUrl + '/contract/invite-contract-counterparty';
        var headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        var requestOptions = {
            method: 'POST',
            headers: headers,
            body: urlencoded
        };
        if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
        fetch(requestURL, requestOptions)
            .then(response => response.json())
            .then(response => {
                // Handle the response data
                var responseData = response;
                if (responseData && responseData.status == true && responseData.code == 201) {
                    elements.formInviteCounterparty.reset();
                    switchClass(elements.divInviteCounterpartyInvited, displayNoneClass, false);
                    switchClass(elements.sectionInviteCounterparty, displayNoneClass, true);
                    switchClass(elements.sectionContractLists, displayNoneClass, false);
                    switchClass(elements.divContractListItems, displayedInvitecpPending, true);
                    switchClass(elements.divContractListItems, displayedInviteCP, false);
                    getContractDetails();
                } else if (responseData && responseData.status == false && responseData.message) {
                    $('#inviteEmailAddress').parent().append('<label class="error api-error">' + responseData.message + '</label>');
                }
                // TODO: Socket configuration required
                /*var data = {
                    chatRoomName: loggedInUserDetails.userWebId + "_" + documentID,
                    documentMode: documentMode
                }
                socket.emit('switch_document_mode', data);*/
                switchClass(elements.loader, displayNoneClass, true);
            })
            .catch(error => {
                // Handle any errors
                console.log('Error #14031455:', error);
                switchClass(elements.loader, displayNoneClass, true);
            });
    }

    /**
     * @description This function will used for resend the invitation to join this contract as counterparty
     */
    function resendInvitation() {
        try {
            let requestURL = apiBaseUrl + '/contract/resend-couterparty-invite/' + contractID;
            var headers = {
                "Content-Type": "application/json"
            };
            if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
            fetch(requestURL, {headers: headers})
                .then(response => response.json())
                .then(response => {
                    // Handle the response data
                    var responseData = response;
                    if (responseData && responseData.status == true && responseData.code == 200) {
                        elements.snackbar.textContent = responseData.message;
                        elements.snackbar.className = "show";
                        setTimeout(function () {
                            elements.snackbar.classList.remove('show');
                        }, 3000)
                    }
                    switchClass(elements.loader, displayNoneClass, true);
                })
                .catch(error => {
                    // Handle any errors
                    console.log('Error #14031455:', error);
                    switchClass(elements.loader, displayNoneClass, true);
                });
        } catch (error) {
            console.log('Error #14031440:', error);
        }
    }

    /**
     * @description This function will used for cancelled the sent invitation
     */
    function cancelInvitation() {
        try {
            let requestURL = apiBaseUrl + '/contract/cancel-couterparty-invite/' + contractID;
            var headers = {
                "Content-Type": "application/json"
            };
            if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
            fetch(requestURL, {headers: headers})
                .then(response => response.json())
                .then(response => {
                    // Handle the response data
                    var responseData = response;
                    if (responseData && responseData.status == true && responseData.code == 200) {
                        elements.snackbar.textContent = responseData.message;
                        elements.snackbar.className = "show";
                        setTimeout(function () {
                            elements.snackbar.classList.remove('show');
                        }, 3000)
                        switchClass(elements.divInviteCounterpartyInvited, displayNoneClass, true)
                        switchClass(elements.divInviteCounterparty, displayNoneClass, false)
                        switchClass(elements.divContractListItems, displayedInvitecpPending, false)
                        switchClass(elements.divContractListItems, displayedInviteCP, true);
                    }
                    switchClass(elements.loader, displayNoneClass, true);
                })
                .catch(error => {
                    // Handle any errors
                    console.log('Error #14031455:', error);
                    switchClass(elements.loader, displayNoneClass, true);
                });
        } catch (error) {
            console.log('Error #14031505:', error);
        }
    }

    /**
     * @description This function will used for get team and user list of this contract
     * @param popup
     */
    function getContractTeamAndUserList(popup = 'inviteuser') {
        try {
            var requestURL = apiBaseUrl + '/meeting/get-contract-team-and-user-list/' + contractID;
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            };
            var requestOptions = {
                method: 'GET',
                headers: headers,
            };
            fetch(requestURL, {headers: headers})
                .then(response => response.json())
                .then(response => {
                    // Handle the response data
                    if (response && response.status == true && response.code == 200) {
                        var responseData = response.data;
                        var teamLists = responseData.filter((ele) => {
                            return ele.type == "team";
                        });
                        var userLists = responseData.filter((ele) => {
                            return ele.type == "user" && (ele.role !== "Contract Creator" && ele.role !== "Counterparty");
                        });
                        if (teamLists.length > 0) {
                            inviteTeamListIDs = teamLists;
                            if (elements.paragraphTeamsNotFoundMessage) {
                                switchClass(elements.paragraphTeamsNotFoundMessage, displayNoneClass, true);
                            }
                            if (elements.chkboxInviteAllTeams) {
                                switchClass(elements.chkboxInviteAllTeams, displayNoneClass, false);
                            }
                            var html = '';
                            html += '<div class="filter-inner">\n';
                            html += '<ul>\n';
                            teamLists.forEach((ele) => {
                                html += '<li>\n' +
                                    '<div class="form-check" data-id="' + ele.itemId + '" data-json="' + JSON.stringify(ele) + '">\n' +
                                    '<input type="checkbox" id="chkboxInviteTeam_' + ele.itemId + '" class="form-check-input team-chkbox" />' +
                                    '<label for="chkboxInviteTeam_' + ele.itemId + '" class="form-check-label">\n' +
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
                            elements.accordionBodyTeams.innerHTML = html;
                        }
                        if (userLists.length > 0) {
                            inviteUserListIDs = userLists;
                            if (elements.paragraphUsersNotFoundMessage) {
                                switchClass(elements.paragraphUsersNotFoundMessage, displayNoneClass, true);
                            }
                            if (elements.chkboxInviteAllUsers) {
                                switchClass(elements.chkboxInviteAllUsers, displayNoneClass, false);
                            }
                            var html = '';
                            html += '<div class="filter-inner">';
                            html += '<ul>';
                            // ' + IMAGE_USER_PATH_LINK + ele.userImage + '
                            // assets/images/no-profile-image.jpg
                            userLists.forEach((ele) => {
                                html += '<li>';
                                html += '<div class="form-check" data-id="' + ele.itemId + '" data-json="' + JSON.stringify(ele) + '">\n' +
                                    '\t<input type="checkbox" id="chkboxInviteUser_' + ele.itemId + '" class="form-check-input user-chkbox" value="' + ele.itemId + '">\n' +
                                    '\t<label for="chkboxInviteUser_' + ele.itemId + '" class="form-check-label">\n' +
                                    '\t\t<div class="conversation-left">\n' +
                                    '\t\t\t<span class="user-icon" id="userProfileImage">\n' +
                                    '\t\t\t\t<img src="' + (ele.userImage ? IMAGE_USER_PATH_LINK + ele.userImage : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                    '\t\t\t</span>\n' +
                                    '\t\t\t<div class="user-inner">\n' +
                                    '\t\t\t\t<span class="user-name" id="userProfileNameSpan">' + ele.itemName + '</span>\n' +
                                    '\t\t\t\t<p id="userProfileroleSpan">' + ele.role + '</p>\n' +
                                    '\t\t\t</div>\n' +
                                    '\t\t</div>\n' +
                                    '\t</label>\n' +
                                    '</div>';
                                html += '</li>';
                            });
                            html += '</ul>';
                            html += '</div>';
                            elements.accordionBodyUsers.innerHTML = html;
                        }
                    }
                    switchClass(elements.loader, displayNoneClass, true);
                })
                .catch(error => {
                    // Handle any errors
                    console.log('Error #14031455:', error);
                    switchClass(elements.loader, displayNoneClass, true);
                });
        } catch (error) {
            console.log('Error #14031505:', error);
        }
    }

    /**
     * @description This function will used for create clause section on contract
     * @param socket
     */
    function createClauseSection(socket) {
        try {
            switchClass(elements.loader, displayNoneClass, false);
            var randomNumber = Math.floor(Math.random() * (1000000 - 1 + 1)) + 1;
            var commentID = Date.now() + '-' + randomNumber;
            var form = elements.formClause;
            var data = JSON.stringify({
                contractId: contractID,
                contractSection: form.elements['contractSection'].value,
                contractSectionDescription: form.elements['contractDescription'].value,
                assignedTeamAndUserDetails: [...selectedInviteTeams, ...selectedInviteUsers],
                commentId: commentID
            });
            var requestURL = apiBaseUrl + '/contract-section/create-contract-section';
            var headers = {
                "Content-Type": "application/json"
            };
            if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
            var requestOptions = {
                method: 'POST',
                headers: headers,
                body: data
            };
            fetch(requestURL, requestOptions)
                .then(response => response.json())
                .then(response => {
                    // Handle the response data
                    var responseData = response;
                    if (responseData && responseData.status == true && responseData.code == 201) {
                        // Handle the response data
                        redirectToClauseList();
                        if (typeof window.Asc.plugin.executeMethod === 'function') {
                            var sDocumentEditingRestrictions = "none";
                            window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                        }
                        var nContentControlType = 1;
                        var color = {
                            R: 104,
                            G: 215,
                            B: 248,
                        };
                        var nContentControlProperties = {
                            "Id": randomNumber,
                            "Tag": commentID,
                            "Lock": 2,
                            "Color": color,
                            "InternalId": randomNumber.toString()
                        };
                        tagLists.push(nContentControlProperties);
                        if (typeof window.Asc.plugin.executeMethod === 'function') {
                            window.Asc.plugin.executeMethod("AddContentControl", [nContentControlType, nContentControlProperties]);
                            window.Asc.plugin.executeMethod("GetAllContentControls");
                        }

                        if (contractInformation && contractInformation.userWhoHasEditAccess && contractInformation.userWhoHasEditAccess == loggedInUserDetails._id && openContractResponseData.contractCurrentState == 'Edit') {
                            if (typeof window.Asc.plugin.executeMethod === 'function') {
                                var sDocumentEditingRestrictions = "none";
                                window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                            }
                        } else {
                            if (typeof window.Asc.plugin.executeMethod === 'function') {
                                var sDocumentEditingRestrictions = "readOnly";
                                window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                            }
                        }
                        // TODO: Pending clause lists
                        // clauseNextPage = 1;
                        // clauseHasNextPage = true;
                        // clauseLists = [];
                        // getContractSectionList(commentID);
                        // var data = {
                        //     chatRoomName: documentID,
                        //     tagData: JSON.stringify(nContentControlProperties)
                        // };
                        // socket.emit('new_clause_created', data);
                        // location.reload(true);
                        // document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
                        switchClass(elements.sectionCreateClause, displayNoneClass, true);
                        switchClass(elements.sectionContractLists, displayNoneClass, false);
                        switchClass(elements.loader, displayNoneClass, true);
                    } else {
                        switchClass(elements.loader, displayNoneClass, true);
                    }
                    switchClass(elements.loader, displayNoneClass, true);
                })
                .catch(error => {
                    // Handle any errors
                    console.log('Error #14031455:', error);
                    switchClass(elements.loader, displayNoneClass, true);
                });
        } catch (error) {
            console.log('Error #14031505:', error);
        }
    }

    /**
     * @description This function will used for the get all clause section on open contract
     * @param commentThreadID
     */
    function getClauses(commentThreadID = null) {
        try {
            switchClass(elements.loader, displayNoneClass, false);
            var requestURL = apiBaseUrl + '/contract-section/get-contract-sections/' + contractID;
            requestURL += '?';
            var headers = {
                "Content-Type": "application/json"
            };
            if (authToken) headers["Authorization"] = 'Bearer ' + authToken;
            var queryParam = [];
            // Search text
            if (searchText) {
                queryParam.push('filter[search_text]=' + searchText);
            }
            queryParam.push('contractSectionStatus=all');
            // Set sortby created time
            queryParam.push('sort[createdAt]=-1');
            // Set pageSize
            queryParam.push('page=' + clauseNextPage);
            // Set recordLimit
            queryParam.push('limit=' + 3);
            // Set queryparams
            requestURL += queryParam.join('&');

            fetch(requestURL, {headers: headers})
                .then(response => response.json())
                .then(response => {
                    // Handle the response data
                    if (response && response.status == true && response.code == 200) {
                        var responseData = response.data;
                        if (clauseNextPage == 1) {
                            document.getElementById('divContractListItems').innerHTML = '';
                        }
                        if (responseData.data.length > 0) {
                            var result = responseData.data;
                            var html = '';
                            result.forEach((ele) => {
                                clauseLists.push(ele);
                                var commentID = ele.commentId;
                                html += '<div class="contract-item" data-id="' + ele._id + '" data-commentid="' + commentID + '" data-chatwindow="' + (ele.unreadMessageSide ? ele.unreadMessageSide : '-') + '" id="' + commentID.split('-').pop() + '">\n' +
                                    '\t\t\t<a href="#">\n';
                                html += '\t\t\t\t\t\t<span class="notification-no ' + (ele.hasUnreadMessage ? '' : displayNoneClass) + '"></span>';
                                html += '\t\t\t\t\t\t<div class="contract-top">\n' +
                                    '\t\t\t\t\t\t\t\t\t<h3>' + ele.contractSection + '</h3>\n' +
                                    '\t\t\t\t\t\t\t\t\t<p>' + ele.contractSectionDescription + '</p>\n';
                                var contractStatusColorCode = 'active-color';
                                if (ele.contractSectionStatus == 'Drafting') {
                                    contractStatusColorCode = 'fuchsia-color';
                                } else if (ele.contractSectionStatus == 'Under Negotiation') {
                                    contractStatusColorCode = 'blue-color';
                                } else if (ele.contractSectionStatus == 'Agreed Position') {
                                    contractStatusColorCode = 'dark-green-color';
                                } else if (ele.contractSectionStatus == 'Under Revision') {
                                    contractStatusColorCode = 'brown-color';
                                } else if (ele.contractSectionStatus == 'Requires Discussion') {
                                    contractStatusColorCode = 'invited-color';
                                } else if (ele.contractSectionStatus == 'Completed') {
                                    contractStatusColorCode = 'success-color';
                                } else if (ele.contractSectionStatus == 'Withdrawn') {
                                    contractStatusColorCode = 'withdrawn-color';
                                }
                                html += '\t\t\t\t\t\t\t\t\t<button class="btn ' + contractStatusColorCode + '">' + ele.contractSectionStatus + '</button>\n';

                                html += '\t\t\t\t\t\t</div>\n' +
                                    '\t\t\t\t\t\t<div class="contract-foot">\n' +
                                    '\t\t\t\t\t\t\t\t\t<div class="contract-foot-inner">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-foot-item">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<h3>Created by</h3>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-user">\n';

                                html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="approved-user-lists"><img src="' + (ele && ele.createdByUserDetails && ele.createdByUserDetails.imageUrl ? ele.createdByUserDetails.imageUrl : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>' + (ele && ele.createdByUserDetails ? ele.createdByUserDetails.firstName + ' ' + ele.createdByUserDetails.lastName : '') + '</span></div>\n';

                                html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t</div>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-foot-item">\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<h3>Requires action by</h3>\n' +
                                    '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="contract-user">\n';

                                if (ele && ele.actionRequiredByUsers && ele.actionRequiredByUsers.length > 0) {
                                    ele.actionRequiredByUsers.forEach((element) => {
                                        html += '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="approved-user-lists"><img src="' + (element && ele?.imageUrl ? ele?.imageUrl : 'images/no-profile-image.jpg') + '" alt="">\n' +
                                            '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>' + (element ? element.firstName + ' ' + element.lastName : '') + '</span></div>\n';
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
                            if (clauseLists && clauseLists.length > 2) {
                                switchClass(elements.btnScrollDown, displayNoneClass, false);
                            } else {
                                switchClass(elements.btnScrollDown, displayNoneClass, true);
                            }
                            if (clauseNextPage == 1) {
                                document.getElementById('divContractListItems').innerHTML += html;
                            } else {
                                var newElement = document.createElement("div");
                                newElement.innerHTML = html;
                                document.getElementById('divContractListItems').insertAdjacentElement("beforeend", newElement);
                            }
                            clauseHasNextPage = responseData.hasNextPage;
                            clauseNextPage = responseData.nextPage;
                            if (!flagRedirectFirst && sectionID && sectionID != "0") {
                                setTimeout(function () {
                                    flagRedirectClauseCreate = true;
                                    $('.contract-item[data-id="' + sectionID + '"]').click();
                                    document.getElementById('divContractLists').classList.add(displayNoneClass);
                                    if (chatWindows == 'SS') {
                                        $('#btnGoToSameSideChat').click();
                                    } else if (chatWindows == 'CP') {
                                        $('#btnGoToCounterparty').click();
                                    }
                                    flagRedirectFirst = true;
                                }, 500);
                            } else if (commentThreadID) {
                                setTimeout(function () {
                                    flagRedirectClauseCreate = true;
                                    $('.contract-item[data-commentid="' + commentThreadID + '"]').click();
                                    $('#btnGoToSameSideChat').click();
                                    if (!openContractUserDetails.canCommunicateWithCounterparty) {
                                        document.getElementById('btnGoToCounterparty').classList.add(displayNoneClass);
                                        document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
                                        $('#chatFooterInner').addClass('justify-content-end');
                                    }
                                    if (openContractUserDetails.openContractDetails.counterPartyInviteStatus != 'Accepted') {
                                        document.getElementById('btnGoToCounterparty').classList.add(displayNoneClass);
                                        document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
                                        $('#chatFooterInner').addClass('justify-content-end');
                                    }
                                }, 500);
                            }
                        } else {
                            var norecordhtml = '<p class="nodata-info">No clauses available</p>';
                            document.getElementById('divContractListItems').innerHTML = norecordhtml;
                            switchClass(elements.btnScrollDown, displayNoneClass, true);
                        }
                    }
                    switchClass(elements.loader, displayNoneClass, true);
                })
                .catch(error => {
                    // Handle any errors
                    console.log('Error #14031455:', error);
                    switchClass(elements.loader, displayNoneClass, true);
                });
        } catch (error) {
            console.log('Error #19031300:', error);
        }
    }

    /**================== API End  =========================*/


})(window, undefined);
