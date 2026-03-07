import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey)

const gallery = document.getElementById("gallery")

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

const img = document.createElement("img")
img.src = art.image_url

const caption = document.createElement("p")
caption.innerText = art.title

artDiv.appendChild(img)
artDiv.appendChild(caption)

gallery.appendChild(artDiv)

})

}

loadArtworks()