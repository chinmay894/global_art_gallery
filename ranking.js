console.log("ranking.js running")

async function loadRanking() {

const { data, error } = await supabaseClient
.from("artworks")
.select("artist_name, likes")

console.log("data:", data)

if(error){
console.log("error:", error)
return
}

const artistLikes = {}

data.forEach(row => {

if(!artistLikes[row.artist_name]){
artistLikes[row.artist_name] = 0
}

artistLikes[row.artist_name] += Number(row.likes) || 0

})

const sortedArtists = Object.entries(artistLikes)
.sort((a,b)=>b[1]-a[1])
.slice(0,4)

const names = sortedArtists.map(a=>a[0])
const likes = sortedArtists.map(a=>a[1].likes)


showTopArtists(names,likes,avatars)
createChart(names,likes)

}

function createChart(names, likes){

const ctx = document.getElementById("rankingChart")

new Chart(ctx,{
type:"bar",
data:{
labels:names,
datasets:[{
label:"Total Likes",
data:likes
}]
}
})

}



loadRanking()