// Add your inline JS here
let btn = document.getElementById("btn");
btn.addEventListener("click", function(){
    document.body.classList.toggle("dark-mode");
    btn.classList.toggle("ph-toggle-right");

    // Store the preference
    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
})

// Check for saved preference when the page loads
if(localStorage.getItem("darkMode") === "enabled"){
    document.body.classList.add("dark-mode");
    btn.classList.add("ph-toggle-right");
}

// Check system preference
// if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//     document.body.classList.add("dark-mode");
//     btn.classList.add("ph-toggle-right");
// }

