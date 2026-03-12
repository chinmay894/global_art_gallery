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

if (!session) {
  window.location.href = "login.html"
}

const user = session.user

/* LOAD PROFILE */

const { data: profile } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if (profile) {

document.getElementById("artistName").value = profile.artist_name
document.getElementById("artistBio").value = profile.artist_bio
document.getElementById("artistInstagram").value = profile.support_link

if(profile.artist_avatar){
document.getElementById("avatarPreview").src = profile.artist_avatar
}

}

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

if(!avatar){
alert("Avatar required")
return
}

/* CHECK EXISTING PROFILE */

const { data: existing } = await supabase
.from("artists")
.select("*")
.eq("user_id", user.id)
.maybeSingle()

if(existing){
alert("Profile already exists")
return
}

/* UPLOAD AVATAR */

const avatarName = user.id + "-" + Date.now() + "-" + avatar.name

const { error: uploadError } =
await supabase.storage
.from("artists")
.upload(avatarName, avatar)

if(uploadError){
alert(uploadError.message)
return
}

/* GET URL */

const { data } = supabase.storage
.from("artists")
.getPublicUrl(avatarName)

/* INSERT PROFILE */

const { error } = await supabase
.from("artists")
.insert([
{
user_id: user.id,
artist_name: name,
artist_avatar: data.publicUrl,
artist_bio: bio,
support_link: link
}
])

if(error){
alert(error.message)
return
}

alert("Profile created successfully")

})