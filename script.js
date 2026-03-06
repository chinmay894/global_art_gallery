const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")

const gallery = document.getElementById("gallery")

let imageCount = 1

function loadArtworks(){

for(let i=0;i<8;i++){

const artDiv = document.createElement("div")
artDiv.className = "art"

const img = document.createElement("img")

img.src = `https://picsum.photos/500/600?random=${imageCount++}`

const caption = document.createElement("p")
caption.innerText = "Artwork from a global artist"

artDiv.appendChild(img)
artDiv.appendChild(caption)

const likeBtn = document.createElement("button")
likeBtn.innerText = "❤️ Like"
likeBtn.className = "likeBtn"

artDiv.appendChild(likeBtn)
const saveBtn = document.createElement("button")
saveBtn.innerText = "Save"
saveBtn.className = "saveBtn"

artDiv.appendChild(saveBtn)
saveBtn.addEventListener("click", (event) => {

event.stopPropagation()

let saved = JSON.parse(localStorage.getItem("savedArt")) || []

if(!saved.includes(img.src)){
saved.push(img.src)
}

localStorage.setItem("savedArt", JSON.stringify(saved))

saveBtn.innerText = "Saved"

})
likeBtn.addEventListener("click", (event) => {

event.stopPropagation()

let liked = JSON.parse(localStorage.getItem("likedArt")) || []

liked.push(img.src)

localStorage.setItem("likedArt", JSON.stringify(liked))

likeBtn.innerText = "❤️ Liked"

})
artDiv.addEventListener("click", () => {

const modal = document.getElementById("artModal")
const modalImg = document.getElementById("modalImg")
const modalCaption = document.getElementById("modalCaption")

modal.style.display = "flex"
modalImg.src = img.src
modalCaption.innerText = caption.innerText

})

gallery.appendChild(artDiv)

}

}

loadArtworks()

window.addEventListener("scroll", () => {

if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 100){

loadArtworks()

}

})
const modal = document.getElementById("artModal")
const closeModal = document.getElementById("closeModal")

closeModal.onclick = function(){
modal.style.display = "none"
}
searchBtn.addEventListener("click", () => {

gallery.innerHTML = ""

imageCount = Math.floor(Math.random()*1000)

loadArtworks()

})
