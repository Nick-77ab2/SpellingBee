$(document).ready(function() {
    let login = $("#logInBtn");
    let signUp = $("#signUpBtn");

    login.click(()=>{
        if($("#logInForm").valid()){
            let userField = $("#username").val();
            let pass = $("#pass").val();
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: userField,
                    password: pass
                    }),
                }).then(function(res){
                    if(res.status === 200){
                        console.log("success");
                        window.location.pathname = '/game'
                    } else if(res.status === 401){
                        console.log("UNAUTHORIZED");
                        alert("INCORRECT USER/PASS");
                    } else {
                        console.log("server error");
                    }
                }).catch((error) => {console.log(error)});
            }
    });

    signUp.click(()=>{
        if($("#signUpForm").valid()){
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: $("#user").val(),
                    pass1: $("#pass1").val(),
                    pass2: $("#pass2").val(),
                    }),
                }).then(function(res){
                    if(res.status === 200){
                        console.log("success");
                        window.location.pathname = '/game'
                    } else {
                        alert("Username must be 4-15 characters\nPassword must have 6-24 characters\nPasswords Must Match");
                        console.log("Bad Request");
                    }
                }).catch((error) => {console.log(error)});
            }
    });

    $("#signUpForm").validate({
        rules: {
            user : {
                required: true,
                minlength: 4,
                maxlength: 15
                },
            pass1 : {
                required: true,
                minlength: 6,
                maxlength: 24
                },
            pass2 : {
                required: true,
                equalTo: "#pass1"
                }
        },
        messages : {
            user : {
                minlength: "Username must be at least 4 characters",
                maxlength: "Username cannot exceed 15 characters"
            },
            pass1 : {
                minlength: "Password must have atleast 6 characters",
                maxlength: "Passwork cannot exceed 24 chracters"
            },
            pass2 : {
                equalTo: "Passwords must match"
            }
        }
    });

    $("#logInForm").validate({
        rules: {
            userOemail : {
                required: true,
                minlength: 4
            },
            pass : {
                required: true,
                minlength: 6
            },
        },
        messages : {
            userOemail:{
                required: "Enter username"
            }
        }
    });

});