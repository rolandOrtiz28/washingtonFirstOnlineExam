// showpassword
let eyeicon = document.getElementById("eye-icon")
let password = document.getElementById("password")
let eyeicon2 = document.getElementById("eye-icon2")
let password2 = document.getElementById("password2")

eyeicon.onclick = function () {
    if (password.type == "password") {
        password.type = "text";
        eyeicon.innerHTML = '<i class="far fa-eye-slash"></i>';
    } else {
        password.type = "password";
        eyeicon.innerHTML = '<i class="far fa-eye"></i>';
    }
}
eyeicon2.onclick = function () {
    if (password2.type == "password") {
        password2.type = "text";
        eyeicon2.innerHTML = '<i class="far fa-eye-slash"></i>';
    } else {
        password2.type = "password";
        eyeicon2.innerHTML = '<i class="far fa-eye"></i>';
    }
}

// password requirements

const passwordInput = document.getElementById("password2");
const passwordAlert = document.getElementById("password-alert");
const checkLeng = document.querySelector(".leng i.fas.fa-check");
const crossLeng = document.querySelector(".leng i.fas.fa-times");
const checkBigLetter = document.querySelector(".big-letter i.fas.fa-check");
const crossBigLetter = document.querySelector(".big-letter i.fas.fa-times");
const checkNum = document.querySelector(".num i.fas.fa-check");
const crossNum = document.querySelector(".num i.fas.fa-times");


const lengRegex = /.{8,}/;
const bigLetterRegex = /[A-Z]/;
const numRegex = /[0-9]/;


passwordInput.addEventListener("focus", function () {
    passwordAlert.classList.remove("d-none");
});

passwordInput.addEventListener("blur", function () {
    passwordAlert.classList.add("d-none");
});

passwordInput.addEventListener("input", function () {
    const password = passwordInput.value;
    if (lengRegex.test(password)) {
        checkLeng.classList.remove("d-none");
        crossLeng.classList.add("d-none");
    } else {
        checkLeng.classList.add("d-none");
        crossLeng.classList.remove("d-none");
    }
    if (bigLetterRegex.test(password)) {
        checkBigLetter.classList.remove("d-none");
        crossBigLetter.classList.add("d-none");
    } else {
        checkBigLetter.classList.add("d-none");
        crossBigLetter.classList.remove("d-none");
    }
    if (numRegex.test(password)) {
        checkNum.classList.remove("d-none");
        crossNum.classList.add("d-none");
    } else {
        checkNum.classList.add("d-none");
        crossNum.classList.remove("d-none");
    }


    const isValid = lengRegex.test(password) && bigLetterRegex.test(password) && numRegex.test(password);
    if (isValid) {
        passwordInput.classList.remove("is-invalid");
        passwordInput.classList.add("is-valid");
        passwordAlert.classList.remove("alert-warning");
        passwordAlert.classList.add("alert-success");
    } else {
        passwordInput.classList.remove("is-valid");
        passwordInput.classList.add("is-invalid");
        passwordAlert.classList.remove("alert-success");
        passwordAlert.classList.add("alert-warning");
    }
});

// bootstrap validation
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()