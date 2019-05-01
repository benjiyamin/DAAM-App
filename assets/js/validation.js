$("#zipCodeInput").on("blur", function () {
    var zip = $("#zipCodeInput").val().trim()
    var zipCodeLength = zip.length
    if (zipCodeLength === 5) {
        console.log("zip is validated")
        $("#invalid-feedback-zip").hide()
        $("#homeNext").attr("disabled", false)
    }
    else {
        $("#invalid-feedback-zip").show()
        $("#invalid-feedback-zip").text("Please type in the 5 digit zip code.")
        $("#homeNext").attr("disabled", true)
    }
})
window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {

        $("#homeNext").on("click", function () {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        })
    });
}, false);


