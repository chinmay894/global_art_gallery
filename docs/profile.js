import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

/* CHECK LOGIN */

const { data: { user } } = await supabase.auth.getUser()

if(!user){
alert("Please login first")
window.location.href = "login.html"
}
/* LOAD EXISTING PROFILE */
/* LOAD EXISTING PROFILE */

const { data: profile } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if(profile){

document.getElementById("artistName").value = profile.artist_name
document.getElementById("artistBio").value = profile.artist_bio
document.getElementById("artistInstagram").value = profile.support_link

if(profile.artist_avatar){
document.getElementById("avatarPreview").src = profile.artist_avatar
}

}
/* AVATAR PREVIEW */

const avatarInput = document.getElementById("artistAvatar")
const avatarPreview = document.getElementById("avatarPreview")

avatarInput.addEventListener("change", () => {

const file = avatarInput.files[0]

if(file){
avatarPreview.src = URL.createObjectURL(file)
}

})

/* SAVE PROFILE */

document.getElementById("saveProfile").addEventListener("click", async () => {

const name = document.getElementById("artistName").value
const bio = document.getElementById("artistBio").value
const link = document.getElementById("artistInstagram").value
const avatar = document.getElementById("artistAvatar").files[0]

if(!name){
alert("Artist name required")
return
}

if(!avatar && !avatarPreview.src){
alert("Avatar required")
return
}
/* CHECK EXISTING PROFILE */

const { data: existingProfile } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if(existingProfile){
alert("You already created your artist profile")
return
}

/* UPLOAD AVATAR */

const avatarName = Date.now() + "-" + avatar.name

const { error: uploadError } = await supabase.storage
.from("artists")
.upload(avatarName, avatar)

if(uploadError){
alert("Avatar upload failed")
return
}

/* GET PUBLIC URL */

const { data } = supabase.storage
.from("artists")
.getPublicUrl(avatarName)

const avatarUrl = data.publicUrl

/* SAVE PROFILE */
console.log(user.id, name, avatarUrl, bio, link)
const { error } = await supabase
.from("artists")
.insert([
{
user_id: user.id,
artist_name: name,
artist_avatar: avatarUrl,
artist_bio: bio,
support_link: link
}
])

if(error){
alert("Database save failed")
return
}

alert("Profile saved successfully!")

})