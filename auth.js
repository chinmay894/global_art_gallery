import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://fxtndjohhnyfuewyrcqm.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dG5kam9oaG55ZnVld3lyY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTQ1NzUsImV4cCI6MjA4ODM5MDU3NX0.MY7k5z2eAPypC1cFURAtw-XPBw8b_q4-iUzyFjgf4IU"

const supabase = createClient(supabaseUrl, supabaseKey)

/* SIGNUP */

document.getElementById("signup").addEventListener("click", async () => {

const email = document.getElementById("email").value
const password = document.getElementById("password").value

const { error } = await supabase.auth.signUp({
  email,
  password
})

if(error){
  alert(error.message)
  return
}

alert("Signup successful!")

})

/* LOGIN */

document.getElementById("login").addEventListener("click", async () => {

const email = document.getElementById("email").value
const password = document.getElementById("password").value

const { error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if(error){
  alert(error.message)
  return
}

window.location.href = "profile.html"

})