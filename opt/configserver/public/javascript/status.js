$( document ).ready(function() {

    function getStatus() {
        $.ajax({
            url: '/status',
            type: 'GET',
            success: function (data) {
                console.log(data);
                var text = "";
                $("#statusArea").empty();
                data.content.forEach(function (element) {
                    $("#statusArea").append(`<div class="col-xs-12">${element}</div>`);
                }, this);
            }
        });
        setTimeout(getStatus,5000);
    }

    function getToken() {
        $.ajax({
            url: '/gettoken',
            type: 'GET',
            success: function (data) {
                console.log(data);
                var text = "";
                $("#authInput").val(data);
            }
        });
    }

    getToken();
    getStatus();
});