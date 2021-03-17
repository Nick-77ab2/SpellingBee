let picture = document.getElementById("picture_hide");

picture.addEventListener("click", function (e) {
    e.preventDefault();
    picture.style.display = "none";
});

function showVideo() {
    let load_video = document.getElementById('load_video');
    load_video.style.display = "block";
    load_video.style.visibility = "visible";
}