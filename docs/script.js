import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey)

/* ELEMENTS */

const gallery = document.getElementById("gallery")
const uploadModal = document.getElementById("uploadModal")
const openUpload = document.getElementById("openUpload")
const closeUpload = document.getElementById("closeUpload")
const uploadBtn = document.getElementById("uploadBtn")

/* OPEN / CLOSE UPLOAD MODAL */

openUpload.onclick = () => {
uploadModal.style.display = "flex"
}

closeUpload.onclick = () => {
uploadModal.style.display = "none"
}

/* LOAD APPROVED ARTWORKS */

async function loadArtworks(){

const { data, error } = await supabase
.from("artworks")
.select("*")
.eq("status","approved")

if(error){
console.error(error)
return
}

gallery.innerHTML = ""

if(!data) return

data.forEach(art => {

const artDiv = document.createElement("div")
artDiv.className = "art"
artDiv.dataset.title = art.title.toLowerCase()
artDiv.dataset.artist = (art.artist_name || "").toLowerCase()

let media

if(art.type === "video"){

media = document.createElement("video")
media.src = art.image_url
media.controls = true
media.className = "artMedia"

}else{

media = document.createElement("img")
media.src = art.image_url
media.className = "artMedia"

}

const caption = document.createElement("p")
caption.innerText = art.title

/* ARTIST BOX */

const artistBox = document.createElement("div")
artistBox.className = "artistBox"

const avatar = document.createElement("img")
avatar.src = art.artist_avatar || "https://via.placeholder.com/30"
avatar.className = "artistAvatar"

const artistName = document.createElement("span")
artistName.innerText = art.artist_name || "Anonymous Artist"

/* LIKE SYSTEM */

const likeBox = document.createElement("div")
likeBox.className = "likeBox"

const likeIcon = document.createElement("span")
likeIcon.className = "likeIcon"

const likedKey = "liked_" + art.id

if(localStorage.getItem(likedKey)){
likeIcon.innerText = "❤️"
}else{
likeIcon.innerText = "🤍"
}

const likeCount = document.createElement("span")
likeCount.innerText = art.likes || 0
likeCount.className = "likeCount"

likeBox.addEventListener("click", async (event) => {

event.stopPropagation()

let newLikes = art.likes || 0

if(localStorage.getItem(likedKey)){

newLikes = newLikes - 1
localStorage.removeItem(likedKey)
likeIcon.innerText = "🤍"

}else{

newLikes = newLikes + 1
localStorage.setItem(likedKey,"true")
likeIcon.innerText = "❤️"

}

const { error } = await supabase
.from("artworks")
.update({ likes: newLikes })
.eq("id", art.id)

if(error){
console.error(error)
return
}

likeCount.innerText = newLikes
art.likes = newLikes

})

likeBox.appendChild(likeIcon)
likeBox.appendChild(likeCount)

artistBox.appendChild(avatar)
artistBox.appendChild(artistName)
artistBox.appendChild(likeBox)

/* APPEND ELEMENTS */

artDiv.appendChild(media)
artDiv.appendChild(caption)
artDiv.appendChild(artistBox)

/* FULLSCREEN MODAL */

artDiv.addEventListener("click", () => {

const modal = document.getElementById("artModal")
const modalImg = document.getElementById("modalImg")
const modalCaption = document.getElementById("modalCaption")

modal.style.display = "flex"
modalImg.src = art.image_url
modalCaption.innerText = art.title

history.pushState({ modalOpen: true }, "")

})

gallery.appendChild(artDiv)

})

}

loadArtworks()

/* UPLOAD ARTWORK */

uploadBtn.onclick = async () => {

const { data: { user } } = await supabase.auth.getUser()

if(!user){
alert("Please login first")
return
}

/* TRY GET PROFILE */

let artistName = "Anonymous Artist"
let artistAvatar = "https://via.placeholder.com/30"

const { data: profile } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if(profile){
artistName = profile.artist_name
artistAvatar = profile.artist_avatar
}

/* GET FILE */

const title = document.getElementById("uploadTitle").value
const file = document.getElementById("uploadImage").files[0]

if(!file){
alert("Please select a file")
return
}

const fileType = file.type.startsWith("video") ? "video" : "image"

/* UNIQUE FILE NAME */

const fileName = user.id + "-" + Date.now() + "-" + file.name

/* UPLOAD FILE */

const { error: uploadError } = await supabase.storage
.from("artworks")
.upload(fileName, file)

if(uploadError){
console.error(uploadError)
alert("Upload failed")
return
}

/* GET PUBLIC URL */

const { data } = supabase.storage
.from("artworks")
.getPublicUrl(fileName)

/* INSERT INTO DATABASE */

const { error: insertError } = await supabase
.from("artworks")
.insert([
{
title: title,
image_url: data.publicUrl,
type: fileType,
artist_name: artistName,
artist_avatar: artistAvatar,
status: "pending"
}
])

if(insertError){
console.error(insertError)
alert("Database insert failed")
return
}

alert("Artwork uploaded! Waiting for approval.")

uploadModal.style.display = "none"

}

/* REALTIME GALLERY UPDATE */

supabase
.channel('artworks-channel')
.on(
'postgres_changes',
{
event: '*',
schema: 'public',
table: 'artworks'
},
(payload) => {

console.log("Database updated", payload)
loadArtworks()

}
)
.subscribe()

/* CLOSE MODAL */
/* CLOSE MODAL */

const closeModal = document.getElementById("closeModal")

closeModal.onclick = function(){
document.getElementById("artModal").style.display = "none"
history.back()
}

/* HANDLE MOBILE BACK BUTTON */

window.addEventListener("popstate", () => {

const modal = document.getElementById("artModal")

if(modal.style.display === "flex"){
modal.style.display = "none"
}

})

/* SEARCH */

const searchInput = document.getElementById("searchInput")

searchInput.addEventListener("input", () => {

const searchValue = searchInput.value.toLowerCase()

const artworks = document.querySelectorAll(".art")

artworks.forEach(art => {

const title = art.dataset.title
const artist = art.dataset.artist

if(title.includes(searchValue) || artist.includes(searchValue)){
art.style.display = "block"
}else{
art.style.display = "none"
}

})

})