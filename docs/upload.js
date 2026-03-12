import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

/* WAIT FOR SESSION */

const { data: { session } } = await supabase.auth.getSession()

if(!session){
window.location.href = "login.html"
}

const user = session.user

/* CHECK ARTIST PROFILE */

const { data: artist } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if(!artist){
alert("Create artist profile first")
window.location.href = "profile.html"
}

/* UPLOAD ARTWORK */

document.getElementById("uploadBtn").addEventListener("click", async () => {

const file = document.getElementById("image").files[0]
const title = document.getElementById("title").value

if(!file){
alert("Select image")
return
}

const fileName = user.id + "-" + Date.now() + "-" + file.name

/* STORAGE UPLOAD */

const { error: uploadError } =
await supabase.storage
.from("artworks")
.upload(fileName, file)

if(uploadError){
alert(uploadError.message)
return
}

/* PUBLIC URL */

const { data } =
supabase.storage
.from("artworks")
.getPublicUrl(fileName)

/* SAVE ARTWORK */

const { error } = await supabase
.from("artworks")
.insert([
{
title: title,
image_url: data.publicUrl,
status: "pending",
artist_id: user.id
}
])

if(error){
alert(error.message)
return
}

alert("Artwork submitted for approval")

})