const username = document.getElementById("jenengmu");
const password = document.getElementById("passwordmu");
const login = document.getElementById("logino");

login.addEventListener("click", () => {
    // username.classList.remove("error");
    // password.classList.remove("error");
    // if (username.value === "" || username.value === null) {
    //     username.classList.add("error");
    // } else if (password.value === "" || password.value === null) {
    //     password.classList.add("error");
    // } else {
    //     window.location.href = "index.html";
    // }
    console.log(username.value);
    console.log(password.value);
});