const board = ["x", "o","x","x"];

function findPlays(object, player){
   const playlist = [] 
    for (let i=0; i < object.length; i++){
        if(object[i] === player);
        playlist.push(i);
    }
    return playlist;
}

const player = "o";
const plays = findPlays(board, player)

console.log(plays)
