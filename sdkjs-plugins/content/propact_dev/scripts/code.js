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
    var flagSocketInit = false;
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
    var baseUrl = 'http://localhost:3000';
    var apiBaseUrl = baseUrl + '/api/v1/app';
    var IMAGE_USER_PATH_LINK = 'https://propact.s3.amazonaws.com/';
    var clauseRecordLimit = 10;
    var clauseNextPage = 1;
    var clauseHasNextPage = true;
    var searchText = '';
    var searchTimeout;
    let tagLists = [];
    var selectedCommentThereadID = '';
    var selectedThreadID = '';
    var loggedInUserDetails;
    let typingTimeout;
    let tyingUserArray = [];
    let generalChatMessage = [];
    let withType;
    var counterPartyCustomerDetail;
    var messageConfirmationFor;
    var chatRecordLimit = 10;
    var chatNextPage = 1;
    var chatHasNextPage = true;
    var chatHistoryRecordLimit = 10;
    var chatHistoryNextPage = 1;
    var chatHistoryHasNextPage = true;
    let socket = '';


    /**================================== Plugin Init Start ===============================*/
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
            selectedCommentThereadID = '';
            $('.div-selected').removeClass('div-selected');
            getContractSectionList();
            document.getElementById('divContractLists').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnGoToSameSideChat = document.getElementById('btnGoToSameSideChat');
        varBtnGoToSameSideChat?.addEventListener('click', async function () {
            withType = 'Our Team';
            messageConfirmationFor = 'Same Side';
            document.getElementById('chatArea').innerHTML = '';
            chatNextPage = 1;
            chatHasNextPage = true;
            await getContractSectionMessageList('our');
            let chatRoomName = withType == 'Our Team' ? 'user_' + selectedCommentThereadID : "counter_" + selectedCommentThereadID;
            socket.emit('join_contract_section_chat_room', chatRoomName);
            document.getElementById('chatHeader').classList.remove('counterparty');
            document.getElementById('btnGoToCounterpartyA').classList.remove(displayNoneClass);
            document.getElementById('chatFooterInner').classList.remove('justify-content-end');
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnGoToCounterparty = document.getElementById('btnGoToCounterparty');
        varBtnGoToCounterparty?.addEventListener('click', async function () {
            withType = 'Counterparty';
            messageConfirmationFor = 'Opposite Side';
            document.getElementById('chatArea').innerHTML = '';
            chatNextPage = 1;
            chatHasNextPage = true;
            await getContractSectionMessageList('Counterparty');
            let chatRoomName = withType == 'Our Team' ? 'user_' + selectedCommentThereadID : "counter_" + selectedCommentThereadID;
            socket.emit('join_contract_section_chat_room', chatRoomName);
            document.getElementById('chatHeader').classList.add('counterparty');
            document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
            document.getElementById('chatFooterInner').classList.add('justify-content-end');
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });
        // Contract chat history screen

        // Contract sameside chat screen
        const varBtnmessageInput = document.getElementById('messageInput');
        varBtnmessageInput?.addEventListener('keydown', function () {
            var data = {
                chatRoomName: withType == 'Our Team' ? 'user_' + selectedCommentThereadID : "counter_" + selectedCommentThereadID,
                userName: loggedInUserDetails.firstName,
                with: withType
            }
            user_is_typing_contract_section(socket, data);
        });

        const varBtnGoToConversionHistory = document.getElementById('btnGoToConversionHistory');
        varBtnGoToConversionHistory.addEventListener('click', function () {
            chatHistoryNextPage = 1;
            chatHistoryHasNextPage = true;
            getContractSectionMessageHistory();
            document.getElementById('divContractSameSideChat').classList.add(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.remove(displayNoneClass);
        });

        const varBtnGoToCounterpartyA = document.getElementById('btnGoToCounterpartyA');
        varBtnGoToCounterpartyA.addEventListener('click', async function () {
            withType = 'Counterparty';
            messageConfirmationFor = 'Opposite Side';
            document.getElementById('chatArea').innerHTML = '';
            chatNextPage = 1;
            chatHasNextPage = true;
            await getContractSectionMessageList('Counterparty');
            let chatRoomName = withType == 'Our Team' ? 'user_' + selectedCommentThereadID : "counter_" + selectedCommentThereadID;
            socket.emit('join_contract_section_chat_room', chatRoomName);
            document.getElementById('chatHeader').classList.add('counterparty');
            document.getElementById('btnGoToCounterpartyA').classList.add(displayNoneClass);
            document.getElementById('chatFooterInner').classList.add('justify-content-end');
            document.getElementById('divContractSameSideChat').classList.remove(displayNoneClass);
            document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
        });

        const varBtnRedirectClauseListsB = document.getElementById('btnRedirectClauseListsB');
        varBtnRedirectClauseListsB.addEventListener('click', function () {
            selectedCommentThereadID = '';
            $('.div-selected').removeClass('div-selected');
            getContractSectionList();
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
                }
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
        });

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

        $(document).on('click', '.contract-item', async function () {
            fClickLabel = true;
            var elementID = $(this).attr('id');
            let tagExists = tagLists.findIndex((ele) => +ele.Id == +elementID);
            if (tagExists > -1) {
                selectedCommentThereadID = tagLists[tagExists].Tag;
                selectedThreadID = $(this).data('id');
                chatHistoryNextPage = 1;
                chatHistoryHasNextPage = true;
                getContractSectionMessageHistory();
                let chatRoomName = 'conversion_history_' + selectedCommentThereadID;
                socket.emit('join_contract_section_chat_room', chatRoomName);
                document.getElementById('divContractLists').classList.add(displayNoneClass);
                document.getElementById('divContractChatHistory').classList.remove(displayNoneClass);
                // window.Asc.plugin.executeMethod("SelectContentControl", [tagLists[tagExists].InternalId]);
            }
        });

        $(document).on('click', '#btnSend', async function () {
            chat_message = $('#messageInput').val();
            const addNewContractMessageDetail = {
                "contractId": documentID,
                "contractSectionId": selectedThreadID,
                "message": chat_message,
                "with": withType,
                "messageType": 'Normal',
                "companyId": loggedInUserDetails.company._id,
                "oppositeCompanyId": counterPartyCustomerDetail.company._id,
                "threadID": selectedCommentThereadID,
                "status": 'send',
                "actionperformedbyUser": loggedInUserDetails.firstName + " " + loggedInUserDetails.lastName,
                "actionperformedbyUserImage": loggedInUserDetails.imageUrl,
                "actionperformedbyUserRole": loggedInUserDetails.role,
                "messageConfirmationFor": messageConfirmationFor,
                "chatRoomName": withType == 'Our Team' ? 'user_' + selectedCommentThereadID : 'counter_' + selectedCommentThereadID,
                "messageNumber": 0
            }
            await addContractSectionMessage(addNewContractMessageDetail, socket);
        });

        document.getElementById('chatBodyID').onscroll = (e) => {
            if (document.getElementById('chatBodyID')?.scrollTop == 0 && chatHasNextPage && chatNextPage != 1) {
                getContractSectionMessageList(withType == 'Our Team' ? 'our' : 'Counterparty');
            }
        };

        document.getElementById('chatHistoryBodyID').onscroll = (e) => {
            if (document.getElementById('chatHistoryBodyID')?.scrollTop == 0 && chatHistoryNextPage && chatHistoryNextPage != 1) {
                getContractSectionMessageHistory();
            }
        };
    };
    /**================================== Plugin Init End =================================*/

    /**=========================== Plugin onMethodReturn Start ============================*/
    window.Asc.plugin.onMethodReturn = function (returnValue) {
        //evend return for completed methods
        var _plugin = window.Asc.plugin;
        if (_plugin.info.methodName == "GetAllContentControls") {
            if (fBtnGetAll) {
                fBtnGetAll = false;
                for (var i = 0; i < returnValue.length; i++) {
                    let tagExists = tagLists.findIndex((ele) => +ele.Id == +returnValue[i].Id);
                    if (tagExists < 0) {
                        tagLists.push(returnValue[i]);
                    }
                }
            } else {
                // document.getElementById("divG").innerHTML = "";
                for (var i = 0; i < returnValue.length; i++) {
                    let tagExists = tagLists.findIndex((ele) => +ele.Id == +returnValue[i].Id);
                    if (tagExists < 0) {
                        tagLists.push(returnValue[i]);
                    }
                }
            }
        } else if (_plugin.info.methodName == "GetCurrentContentControl") {
            if (tagLists && tagLists.length > 0 && returnValue) {
                let selectedTag = tagLists.findIndex((ele) => +ele.InternalId == +returnValue);
                if (fClickBtnCur) {
                    //method for select content control by id
                    window.Asc.plugin.executeMethod("SelectContentControl", [tagLists[selectedTag].Id]);
                    fClickBtnCur = false;
                } else if (!($('.div-selected').length && $('.div-selected')[0].id === tagLists[selectedTag].Id) && tagLists[selectedTag].Id) {
                    if (document.getElementById(tagLists[selectedTag].Id)) {
                        selectedCommentThereadID = tagLists[selectedTag].Tag;

                        let chatRoomName = withType == 'Our Team' ? 'user_' + selectedCommentThereadID : "counter_" + selectedCommentThereadID;
                        socket.emit('join_contract_section_chat_room', chatRoomName);

                        $('.div-selected').removeClass('div-selected');
                        $('#contractListItemsDiv #' + tagLists[selectedTag].Id).addClass('div-selected');
                    }
                } else if (!returnValue) {
                    selectedCommentThereadID = '';
                    $('.div-selected').removeClass('div-selected');
                }
            }
        }
    };
    /**=========================== Plugin onMethodReturn End ==============================*/

    /**================ Plugin event_onTargetPositionChanged Start ========================*/
    window.Asc.plugin.event_onTargetPositionChanged = function () {
        //event change cursor position
        //all events are specified in the config file in the "events" field
        if (!fClickLabel) {
            //menthod for get current content control (where is the cursor located)
            window.Asc.plugin.executeMethod("GetCurrentContentControl");
        }
        fClickLabel = false;
    };
    /**================== Plugin event_onTargetPositionChanged End ========================*/


    /**============================== Utils Function Start ================================*/
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
        updateInviteUsersPlacehoder();
    }

    /**
     * Update invite user checkbox
     */
    function updateInviteUserCheckbox() {
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

    /**
     * @param inputDate
     * @returns {string}
     */
    function formatDate(inputDate) {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const date = new Date(inputDate);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;

        let daySuffix;
        if (day === 1 || day === 21 || day === 31) {
            daySuffix = "st";
        } else if (day === 2 || day === 22) {
            daySuffix = "nd";
        } else if (day === 3 || day === 23) {
            daySuffix = "rd";
        } else {
            daySuffix = "th";
        }

        const formattedDate = `${day}<sup>${daySuffix}</sup> ${month} ${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        return formattedDate;
    }

    socket = io.connect(baseUrl,
        {auth: {authToken}}
    );

    function user_is_typing_contract_section(socket, data) {
        socket.emit('user_is_typing_contract_section', data);
    }

    function setupSocket() {
        /**============================== Socket Function Start ===============================*/
        /** Socket Emit: user typing on contract thread */
        if (!flagSocketInit) {
            socket = io.connect(baseUrl,
                {auth: {authToken}}
            );

            function user_is_typing_contract_section(socket, data) {
                socket.emit('user_is_typing_contract_section', data);
            }

            /** Socket On: user typing for same side */
            socket.on('user_typing_notification_contract_section', data => {
                if (data) {
                    if (tyingUserArray.findIndex(x => x == data) == -1) {
                        tyingUserArray.push(data);
                    }
                    let text = '';
                    if (tyingUserArray.length == 1) {
                        text = tyingUserArray[0] + " is typing...";
                    }
                    if (tyingUserArray.length == 2) {
                        text = tyingUserArray[0] + " and " + tyingUserArray[1] + " is typing...";
                    }
                    if (tyingUserArray.length > 2) {
                        let otherUserCount = tyingUserArray.length - 2
                        text = tyingUserArray[0] + ", " + tyingUserArray[1] + " and " + otherUserCount + " others are typing...";
                    }

                    clearTimeout(typingTimeout);
                    document.getElementById('typingSpan').textContent = text;
                }
                typingTimeout = setTimeout(() => {
                    document.getElementById('typingSpan').textContent = '';
                }, 5000);
            });

            /** Socket On: user typing for counterparty side */
            socket.on('user_typing_notification_counter_contract_section', data => {
                if (data) {
                    if (tyingUserArray.findIndex(x => x == data) == -1) {
                        tyingUserArray.push(data);
                    }
                    let text = '';
                    if (tyingUserArray.length == 1) {
                        text = tyingUserArray[0] + " is typing...";
                    }
                    if (tyingUserArray.length == 2) {
                        text = tyingUserArray[0] + " and " + tyingUserArray[1] + " is typing...";
                    }
                    if (tyingUserArray.length > 2) {
                        let otherUserCount = tyingUserArray.length - 2
                        text = tyingUserArray[0] + ", " + tyingUserArray[1] + " and " + otherUserCount + " others are typing...";
                    }

                    clearTimeout(typingTimeout);
                    document.getElementById('typingSpan').textContent = text;
                }
                typingTimeout = setTimeout(() => {
                    document.getElementById('typingSpan').textContent = '';
                }, 5000);
            });

            /** Socket On: user message get for same side */
            socket.on('receive_contract_section_message', data => {
                let html = '';
                if (data.from == loggedInUserDetails._id) {
                    html += '<div class="message-wrapper reverse">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '</p>\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                } else {
                    html += '<div class="message-wrapper grey-color">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '</p>\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                }
                var contentDiv = document.getElementById("chatArea");
                var newElement = document.createElement("div");
                newElement.innerHTML = html;
                contentDiv.appendChild(newElement);
            });

            /** Socket On: user message get for same side */
            socket.on('receive_counter_contract_section_message', data => {
                let html = '';
                if (data.from == loggedInUserDetails._id) {
                    html += '<div class="message-wrapper reverse ' + (data.with == "Counterparty" ? "light-gold-color" : "") + ' ">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '</p>\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                } else {
                    html += '<div class="message-wrapper grey-color ' + (data.with == "Counterparty" ? "light-gold-color" : "") + ' ">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '</p>\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                }
                var contentDiv = document.getElementById("chatArea");
                var newElement = document.createElement("div");
                newElement.innerHTML = html;
                contentDiv.appendChild(newElement);
            });

            /** Socket On: user message get for conversion history */
            socket.on('receive_conversion_history_message', data => {
                let htmlHistory = '';
                if (data.with == 'Counterparty') {
                    htmlHistory += '<div class="message-wrapper light-gold-color">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '&nbsp;<small>(' + (data && data.actionperformedbyUserRole == 'Counterparty' ? 'Counterparty' : 'Same side') + ')</small>' + '</p>\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                } else {
                    htmlHistory += '<div class="message-wrapper reverse">\n' +
                        '   <div class="profile-picture">\n' +
                        '      <p class="name">' + data.actionperformedbyUser + '&nbsp;<small>(' + (data && data.actionperformedbyUserRole == 'Counterparty' ? 'Counterparty' : 'Same side') + ')</small>' + '</p>\n' +
                        '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                        '      <img src="' + (data.actionperformedbyUserImage ? data.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                        '   </div>\n' +
                        '   <div class="message-content">\n' +
                        '      <div class="message">' + data.message +
                        '      </div>\n' +
                        '   </div>\n' +
                        '</div>\n';
                }
                var contentHistoryDiv = document.getElementById("chatHistoryArea");
                var newHistoryElement = document.createElement("div");
                newHistoryElement.innerHTML = htmlHistory;
                contentHistoryDiv.appendChild(newHistoryElement);
            });

            // Handle connection errors
            socket.on('connect_error', (error) => {
                console.error('Connection Error:', error.message);
            });

            // Handle server-rejected connections
            socket.on('connect_failed', () => {
                console.error('Connection to server failed');
            });

            // Handle general error events
            socket.on('error', (error) => {
                console.error('Socket Error:', error);
            });
            flagSocketInit = true;
        }
        /**============================== Socket Function End =================================*/
    }

    /**============================== Utils Function End ==================================*/

    /**================================ API Function Start ================================*/
    /**
     * @desc Get open contract and user details
     */
    function getOpenContractUserDetails(socket) {
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
                        loggedInUserDetails = responseData.data.loggedInUserDetails;
                        counterPartyCustomerDetail = responseData.data.oppositeUser;
                        document.getElementById('divInviteCounterpartyPending').classList.add(displayNoneClass);
                        document.getElementById('divInviteCounterparty').classList.add(displayNoneClass);
                        document.getElementById('invitationActionPara').classList.add(displayNoneClass);
                        document.getElementById('divContractLists').classList.remove(displayNoneClass);
                        document.getElementById('contractCounterpartySection').classList.remove(disabledClass);
                        document.getElementById('userProfileImage').src = responseData.data.loggedInUserDetails.imageUrl;
                        document.getElementById('counterpartyImage').src = responseData.data.oppositeUser.imageUrl;
                        document.getElementById('organizationImage').src = responseData.data.oppositeUser.company.imageUrl;
                        document.getElementById('userProfileName').textContent = responseData.data.loggedInUserDetails.firstName + " " + responseData.data.loggedInUserDetails.lastName;
                        document.getElementById('userProfileNameA').textContent = responseData.data.loggedInUserDetails.firstName + " " + responseData.data.loggedInUserDetails.lastName;
                        document.getElementById('userProfilerole').textContent = responseData.data.loggedInUserDetails.role;
                        document.getElementById('userProfileroleA').textContent = responseData.data.loggedInUserDetails.role;
                        document.getElementById('organizationName').textContent = responseData.data.oppositeUser.company.companyName;
                        document.getElementById('counterpartyName').textContent = responseData.data.oppositeUser.firstName + " " + responseData.data.oppositeUser.lastName;
                        if (documentMode != 'markup') {
                            getContractTeamAndUserList();
                        }
                        getContractSectionList();
                        setupSocket();
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
                    document.getElementById('contractListItemsDiv').innerHTML = '';
                    if (resData.data.length > 0) {
                        clauseHasNextPage = resData.hasNextPage;
                        clauseNextPage = resData.nextPage;
                        var result = resData.data;
                        var html = '';
                        var html1 = '';
                        result.forEach((ele) => {
                            let commentID = ele.commentId;
                            html += '<div class="contract-item" data-id="' + ele._id + '" data-commentid="' + commentID + '" id="' + commentID.split('-').pop() + '">\n' +
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
                    } else {
                        let norecordhtml = '<p class="nodata-info">No clause available</p>';
                        document.getElementById('contractListItemsDiv').innerHTML = norecordhtml;
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
        try {
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
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    /**
     * @desc Resend counterparty invitation
     */
    function resendCounterpartyInvitation() {
        try {
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
                    const responseData = data;
                    if (responseData && responseData.status == true && responseData.code == 200) {
                        console.log(responseData.message);
                    }
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }

    }

    /**
     * @desc Create clause section
     */
    function createClauseSection() {
        try {
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
                        tagLists.push(nContentControlProperties);
                        window.Asc.plugin.executeMethod("AddContentControl", [nContentControlType, nContentControlProperties]);
                        var sDocumentEditingRestrictions = "readOnly";
                        window.Asc.plugin.executeMethod("SetEditingRestrictions", [sDocumentEditingRestrictions]);
                        getContractSectionList();
                        document.getElementById('divContractChatHistory').classList.add(displayNoneClass);
                        document.getElementById('divContractCreate').classList.add(displayNoneClass);
                        document.getElementById('divContractLists').classList.remove(displayNoneClass);
                    }
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
            // throw error; // You can re-throw the error or handle it here
        }
    }

    /**
     * @param postData
     * @param socket
     * @returns {Promise<void>}
     */
    async function addContractSectionMessage(postData, socket) {
        try {
            var data = JSON.stringify(postData);
            const addContractSectionMessageUrl = apiBaseUrl + '/contractSection/addContractSectionMessage';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            };
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: data
            };
            fetch(addContractSectionMessageUrl, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // Handle the response data
                    document.getElementById("clauseForm").reset();
                    const responseData = data;
                    if (responseData && responseData.status == true && responseData.code == 200) {
                        socket.emit('contract_section_message', postData);
                        let generalChatData = postData;
                        generalChatData.chatRoomName = 'conversion_history_' + selectedCommentThereadID;
                        socket.emit('conversion_history_message', generalChatData);

                        const myTextarea = document.getElementById("messageInput");
                        myTextarea.value = "";

                        let html = '';
                        html += '<div class="message-wrapper reverse ' + (postData.with == "Counterparty" ? "light-gold-color" : "") + ' ">\n' +
                            '   <div class="profile-picture">\n' +
                            '      <p class="last-seen">' + formatDate(new Date()) + '</p>\n' +
                            '      <p class="name">' + postData.actionperformedbyUser + '</p>\n' +
                            '      <img src="' + (postData.actionperformedbyUserImage ? postData.actionperformedbyUserImage : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                            '   </div>\n' +
                            '   <div class="message-content">\n' +
                            '      <div class="message">' + postData.message +
                            '      </div>\n' +
                            '   </div>\n' +
                            '</div>\n';

                        var contentDiv = document.getElementById("chatArea");
                        var newElement = document.createElement("div");
                        newElement.innerHTML = html;
                        contentDiv.appendChild(newElement);

                        const myDiv = document.getElementById("chatBodyID");
                        const scrollToOptions = {
                            top: myDiv.scrollHeight,
                            behavior: 'smooth'
                        };
                        myDiv.scrollTo(scrollToOptions);

                        return true;
                    }
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    /**
     * @param messageType
     * @returns {Promise<void>}
     */
    async function getContractSectionMessageList(messageType = 'our') {
        try {
            let getContractSectionMessageListUrl = apiBaseUrl + '/contractSection/getContractSectionMessageList/' + selectedThreadID + '/' + messageType;
            let queryParam = [];
            // Set sortby created time
            queryParam.push('sort[createdAt]=-1');
            // Set pageSize
            queryParam.push('page=' + chatNextPage);
            // Set recordLimit
            queryParam.push('limit=' + chatRecordLimit);
            // Set queryparams
            getContractSectionMessageListUrl += '?' + queryParam.join('&');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            };
            const requestOptions = {
                method: 'GET',
                headers: headers,
            };
            fetch(getContractSectionMessageListUrl, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // Handle the response data
                    const responseData = data;
                    if (responseData && responseData.status == true && responseData.code == 200 && responseData.data) {
                        if (responseData.data.data.length > 0) {
                            let result;
                            if (chatNextPage == 1) {
                                generalChatMessage = [];
                                document.getElementById('chatArea').innerHTML = '';
                                result = responseData?.data?.data.reverse();
                                const myDiv = document.getElementById("chatBodyID");
                                const scrollToOptions = {
                                    top: myDiv.scrollHeight,
                                    behavior: 'smooth'
                                };
                                myDiv.scrollTo(scrollToOptions);
                            } else {
                                result = responseData?.data?.data;
                            }
                            let setLastHeight = document.getElementById('chatArea').scrollHeight;
                            result.forEach((chatMessage) => {
                                let html = '';
                                if (generalChatMessage.findIndex((ele) => +ele._id == chatMessage._id) < 0) {
                                    if (chatMessage.from == loggedInUserDetails._id) {
                                        html += '<div class="message-wrapper reverse ' + (messageType == "Counterparty" ? "light-gold-color" : "") + '">\n' +
                                            '   <div class="profile-picture">\n' +
                                            '      <p class="last-seen">' + formatDate(chatMessage.createdAt) + '</p>\n' +
                                            '      <p class="name">' + chatMessage.messageSenderUser.firstName + ' ' + chatMessage.messageSenderUser.lastName + '</p>\n' +
                                            '      <img src="' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.imageUrl ? chatMessage.messageSenderUser.imageUrl : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                                            '   </div>\n' +
                                            '   <div class="message-content">\n' +
                                            '      <div class="message">' + chatMessage.message.replaceAll(/\n/g, '<br>') +
                                            '      </div>\n' +
                                            '   </div>\n' +
                                            '</div>\n';
                                    } else {
                                        html += '<div class="message-wrapper grey-color ' + (messageType == "Counterparty" ? "light-gold-color" : "") + '">\n' +
                                            '   <div class="profile-picture">\n' +
                                            '      <img src="' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.imageUrl ? chatMessage.messageSenderUser.imageUrl : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                                            '      <p class="name">' + chatMessage.messageSenderUser.firstName + ' ' + chatMessage.messageSenderUser.lastName + '</p>\n' +
                                            '      <p class="last-seen">' + formatDate(chatMessage.createdAt) + '</p>\n' +
                                            '   </div>\n' +
                                            '   <div class="message-content">\n' +
                                            '      <div class="message">' + chatMessage.message.replaceAll(/\n/g, '<br>') +
                                            '      </div>\n' +
                                            '   </div>\n' +
                                            '</div>\n';
                                    }
                                    generalChatMessage.push(chatMessage);
                                }

                                if (chatNextPage == 1) {
                                    var contentDiv = document.getElementById("chatArea");
                                    var newElement = document.createElement("div");
                                    newElement.innerHTML = html;
                                    contentDiv.appendChild(newElement);
                                    // targetDiv.before(html);
                                } else {
                                    var contentDiv = document.getElementById("chatArea");
                                    var newElement = document.createElement("div");
                                    newElement.innerHTML = html;
                                    contentDiv.insertBefore(newElement, contentDiv.firstChild);
                                }
                            })
                            const myDiv = document.getElementById("chatBodyID");
                            const scrollToOptions = {
                                top: myDiv.scrollHeight,
                                behavior: 'smooth'
                            };
                            if (chatNextPage == 1) {
                                myDiv.scrollTo(scrollToOptions);
                            } else {
                                document.getElementById('chatBodyID').scrollTop = document.getElementById('chatArea').scrollHeight - setLastHeight;
                            }
                            chatHasNextPage = responseData.data.hasNextPage;
                            chatNextPage = responseData.data.nextPage;
                        }
                    }
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    /**
     * @returns {Promise<void>}
     */
    async function getContractSectionMessageHistory() {
        try {
            let getContractSectionMessageListUrl = apiBaseUrl + '/contractSection/getContractSectionMessageList/' + selectedThreadID + '/all';
            let queryParam = [];
            // Set sortby created time
            queryParam.push('sort[createdAt]=-1');
            // Set pageSize
            queryParam.push('page=' + chatHistoryNextPage);
            // Set recordLimit
            queryParam.push('limit=' + chatHistoryRecordLimit);
            // Set queryparams
            getContractSectionMessageListUrl += '?' + queryParam.join('&');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            };
            const requestOptions = {
                method: 'GET',
                headers: headers,
            };
            fetch(getContractSectionMessageListUrl, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // Handle the response data
                    const responseData = data;
                    if (responseData && responseData.status == true && responseData.code == 200 && responseData.data) {
                        if (responseData.data.data.length > 0) {
                            let result;
                            if (chatHistoryNextPage == 1) {
                                document.getElementById('chatHistoryArea').innerHTML = '';
                                result = responseData?.data?.data.reverse();
                                const myDiv = document.getElementById("chatHistoryBodyID");
                                const scrollToOptions = {
                                    top: myDiv.scrollHeight,
                                    behavior: 'smooth'
                                };
                                myDiv.scrollTo(scrollToOptions);
                            } else {
                                result = responseData?.data?.data;
                            }
                            let setLastHeight = document.getElementById('chatHistoryArea').scrollHeight;
                            result.forEach((chatMessage) => {
                                let html = '';
                                if (chatMessage.messageConfirmationFor == 'Same Side') {
                                    html += '<div class="message-wrapper reverse">\n' +
                                        '   <div class="profile-picture">\n' +
                                        '      <p class="last-seen">' + formatDate(chatMessage.createdAt) + '</p>\n' +
                                        '      <p class="name">' + chatMessage.messageSenderUser.firstName + ' ' + chatMessage.messageSenderUser.lastName + '&nbsp;<small>(' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.role == 'Counterparty' ? 'Counterparty' : 'Same side') + ')</small>' + '</p>\n' +
                                        '      <img src="' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.imageUrl ? chatMessage.messageSenderUser.imageUrl : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                                        '   </div>\n' +
                                        '   <div class="message-content">\n' +
                                        '      <div class="message">' + chatMessage.message.replaceAll(/\n/g, '<br>') +
                                        '      </div>\n' +
                                        '   </div>\n' +
                                        '</div>\n';
                                } else {
                                    html += '<div class="message-wrapper light-gold-color">\n' +
                                        '   <div class="profile-picture">\n' +
                                        '      <img src="' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.imageUrl ? chatMessage.messageSenderUser.imageUrl : 'images/no-profile-image.jpg') + '" alt="pp">\n' +
                                        '      <p class="name">' + chatMessage.messageSenderUser.firstName + ' ' + chatMessage.messageSenderUser.lastName + '&nbsp;<small>(' + (chatMessage && chatMessage.messageSenderUser && chatMessage.messageSenderUser.role == 'Counterparty' ? 'Counterparty' : 'Same side') + ')</small>' + '</p>\n' +
                                        '      <p class="last-seen">' + formatDate(chatMessage.createdAt) + '</p>\n' +
                                        '   </div>\n' +
                                        '   <div class="message-content">\n' +
                                        '      <div class="message">' + chatMessage.message.replaceAll(/\n/g, '<br>') +
                                        '      </div>\n' +
                                        '   </div>\n' +
                                        '</div>\n';
                                }
                                if (chatHistoryNextPage == 1) {
                                    var contentDiv = document.getElementById("chatHistoryArea");
                                    var newElement = document.createElement("div");
                                    newElement.innerHTML = html;
                                    contentDiv.appendChild(newElement);
                                    // targetDiv.before(html);
                                } else {
                                    var contentDiv = document.getElementById("chatHistoryArea");
                                    var newElement = document.createElement("div");
                                    newElement.innerHTML = html;
                                    contentDiv.insertBefore(newElement, contentDiv.firstChild);
                                }
                            })
                            const myDiv = document.getElementById("chatHistoryBodyID");
                            const scrollToOptions = {
                                top: myDiv.scrollHeight,
                                behavior: 'smooth'
                            };
                            if (chatHistoryNextPage == 1) {
                                myDiv.scrollTo(scrollToOptions);
                            } else {
                                document.getElementById('chatHistoryBodyID').scrollTop = document.getElementById('chatHistoryArea').scrollHeight - setLastHeight;
                            }
                            chatHistoryHasNextPage = responseData.data.hasNextPage;
                            chatHistoryNextPage = responseData.data.nextPage;
                        } else {
                            document.getElementById('chatHistoryArea').innerHTML = '';
                        }
                    }
                })
                .catch(error => {
                    // Handle any errors
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    /**================================ API Function End ==================================*/

})(window, undefined);