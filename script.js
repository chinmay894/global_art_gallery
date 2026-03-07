import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey)

const gallery = document.getElementById("gallery")
const uploadModal = document.getElementById("uploadModal")
const openUpload = document.getElementById("openUpload")
const closeUpload = document.getElementById("closeUpload")
const uploadBtn = document.getElementById("uploadBtn")

openUpload.onclick = () => {
uploadModal.style.display = "flex"
}

closeUpload.onclick = () => {
uploadModal.style.display = "none"
}

async function loadArtworks(){

const { data, error } = await supabase
.from("artworks")
.select("*")
.eq("status","approved")

console.log(data)

if(error){
console.error(error)
return
}

gallery.innerHTML = ""

data.forEach(art => {

const artDiv = document.createElement("div")
artDiv.className = "art"

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

artDiv.appendChild(media)
artDiv.appendChild(caption)

artDiv.addEventListener("click", () => {

const modal = document.getElementById("artModal")
const modalImg = document.getElementById("modalImg")
const modalCaption = document.getElementById("modalCaption")

modal.style.display = "flex"
modalImg.src = art.image_url
modalCaption.innerText = art.title

})

gallery.appendChild(artDiv)

})

}

loadArtworks()

uploadBtn.onclick = async () => {

const title = document.getElementById("uploadTitle").value
const file = document.getElementById("uploadImage").files[0]
const fileType = file.type.startsWith("video") ? "video" : "image"

if(!file){
alert("Please select an image")
return
}

const fileName = Date.now() + "-" + file.name

// Upload image to Supabase Storage
const { error: uploadError } =
await supabase.storage
.from("artworks")
.upload(fileName, file)

if(uploadError){
console.error(uploadError)
alert("Upload failed")
return
}

// Get public URL of image
const { data } =
supabase.storage
.from("artworks")
.getPublicUrl(fileName)

// Insert artwork record in database
const { error: insertError } =
await supabase
.from("artworks")
.insert([
{
title: title,
image_url: data.publicUrl,
type: fileType,
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

const closeModal = document.getElementById("closeModal")

closeModal.onclick = function(){
document.getElementById("artModal").style.display = "none"
}