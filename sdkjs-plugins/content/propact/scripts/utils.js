$(document).ready(function () {

    let displayNoneClass = 'd-none';

    // Section Invite CounterParty
    /**
     * Invite Counterparties form submit
     */
    $("#inviteForm").validate({
        submitHandler: function (form) {
            // $(form).ajaxSubmit();
            $('#mainLoader').removeClass(displayNoneClass);
            // inviteCounterparties();
        }
    });

    /**
     * Invite Counterparties Cancel Button
     */
    $("#btnInviteCounterpartyCancel").click(function () {
        $("#inviteForm")[0].reset();
        let apiError = document.getElementsByClassName("api-error");
        for (var i = 0; i < apiError.length; i++) {
            var label = apiError[i];
            label.innerHTML = ""; // Remove content
            label.classList.remove("label"); // Remove class
        }
        $('#divInviteCounterparty').removeClass(displayNoneClass);
        $('#sectionContractLists').removeClass(displayNoneClass);
        $('#sectionInviteCounterparty').addClass(displayNoneClass);
    })
    // Section Invite CounterParty

    // Section Contract Lists
    $('#btnInviteCounterpartyForm').click(function () {
        $('#sectionContractLists').addClass(displayNoneClass);
        $('#divInviteCounterparty').addClass(displayNoneClass);
        $('#sectionInviteCounterparty').removeClass(displayNoneClass);
    })
    // Section Contract Lists

});