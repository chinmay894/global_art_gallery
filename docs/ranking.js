console.log("ranking.js running")

async function loadRanking() {

const { data, error } = await supabaseClient
.from("artworks")
.select("artist_name, likes")

if(error){
console.log(error)
return
}

const artistData = {}

data.forEach(row => {

if(!artistData[row.artist_name]){
artistData[row.artist_name] = {
likes:0,
avatar:row.avatar_url
}
}

artistData[row.artist_name].likes += Number(row.likes) || 0

})

const sortedArtists = Object.entries(artistData)
.sort((a,b)=>b[1].likes-a[1].likes)
.slice(0,4)

const names = sortedArtists.map(a=>a[0])
const likes = sortedArtists.map(a=>a[1].likes)
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