console.log('Client side loaded');

$(function(){
  console.log('DOM loaded');

  $("#send").on("click", function(event){
    event.preventDefault();

    var sendData = {};

    sendData.username = $("#username").val();
    sendData.password = $("#password").val();

    console.log(sendData);

    $.post('/', sendData).done(function(response){
      console.log(response);
    })

  })
})
