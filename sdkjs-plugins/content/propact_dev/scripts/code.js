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


    // Plugin Init - Start CM //
    window.Asc.plugin.init = function (text) {

        /** Get & Set variables */
        documentID = getDocumentID(window.Asc.plugin.info.documentCallbackUrl);
        documentMode = getDocumentMode(window.Asc.plugin.info.documentCallbackUrl);
        authToken = window.Asc.plugin.info.documentCallbackUrl.split('/').pop();
        /** Get & Set variables */

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

        /** Utils Function Start */
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
        /** Utils Function End */

        /** API Function Start */
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
                            /*if (documentMode != 'markup') {
                                getContractTeamAndUserList();
                            }
                            getContractSectionList();*/
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
        /** API Function End */

    };
    // Plugin Init - End CM //

})(window, undefined);