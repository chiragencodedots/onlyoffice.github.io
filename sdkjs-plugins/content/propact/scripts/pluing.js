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

    /**
     * @constant
     * @description Define the Path
     */
    var baseUrl = 'http://192.168.1.38:3003';
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

    /**
     * @constant
     * @description Define the variables for plugin setting
     */
    var flagInit = false;

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

        sectionInviteCounterparty: document.getElementById("sectionInviteCounterparty"),
        sectionContractLists: document.getElementById("sectionContractLists"),
    }

    /**================================== Plugin Init Start ===============================*/
    window.Asc.plugin.init = function (text) {

        /**====================== Get & Set variables ======================*/
        contractID = getDocumentID(window.Asc.plugin.info.documentCallbackUrl);
        contractMode = getDocumentMode(window.Asc.plugin.info.documentCallbackUrl);
        splitArray = window.Asc.plugin.info.documentCallbackUrl.split('/');
        authToken = splitArray[11];
        if (splitArray.length >= 13 && splitArray[12] != '0') {
            sectionID = splitArray[12];
        }
        if (splitArray.length >= 14 && splitArray[13] != '0') {
            chatWindows = splitArray[13];
        }
        /**====================== Get & Set variables ======================*/

        /**====================== Section: Contract Lists ======================*/
        elements.btnInviteCounterparty.onclick = function() {
            switchClass(elements.sectionContractLists, displayNoneClass, true);
            switchClass(elements.sectionInviteCounterparty, displayNoneClass, true);
        }
        /**====================== Section: Contract Lists ======================*/



    };
    /**================================== Plugin Init End =================================*/

    /**=========================== Plugin onMethodReturn Start ============================*/
    window.Asc.plugin.onMethodReturn = function (returnValue) {

    };
    /**=========================== Plugin onMethodReturn End ==============================*/

    /**================ Plugin event_onTargetPositionChanged Start ========================*/
    window.Asc.plugin.event_onTargetPositionChanged = function () {

    };
    /**================== Plugin event_onTargetPositionChanged End ========================*/


    /**================== Other Function Start ========================*/
    /**
     * @param url
     * @returns {*|string}
     */
    function getDocumentID(url) {
        var urlArr = url.split('/');
        return urlArr[8];
    }

    /**
     * @param url
     * @returns {*|string}
     */
    function getDocumentMode(url) {
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
    };
    /**================== Other Function End  =========================*/


})(window, undefined);
