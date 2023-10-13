let result = Object();

// Modalen Dialog öffnen um Namen einzugeben
let myModal = new bootstrap.Modal(document.getElementById('playerNames'));
document.getElementById("startbutton").addEventListener("click", function () {

    myModal.show();
})

let players_global = ["a", "b"];


// nach jeder tasteneingabe im formular überprüfen ob
// 4 eindeutige spielerInnennamen vorhanden sind
document.getElementById('playerNamesForm').addEventListener('keyup', function (evt) {
    console.log(evt);

    //TODO

})

// formular submit abfangen
document.getElementById('playerNamesForm').addEventListener('submit', async function (evt) {
    console.log("Spieler hat Button 'Spiel starten' gedrückt!");
    // Formular absenden verhindern
    evt.preventDefault();
    myModal.hide();

    console.log("Name von Spieler 1: ", document.getElementById("playerName1").value);
    console.log("Name von Spieler 2: ", document.getElementById("playerName2").value);
    console.log("Name von Spieler 3: ", document.getElementById("playerName3").value);
    console.log("Name von Spieler 4: ", document.getElementById("playerName4").value);

    players_global = [document.getElementById("playerName1").value, document.getElementById("playerName2").value, document.getElementById("playerName3").value, document.getElementById("playerName4").value];

    console.log("Spieler: ", players_global);

    //liste_von_player
    let playerlist = document.getElementById("playerlist");


    players_global.forEach(ein_player_name => {
        const li = document.createElement("li");
        console.log("li: ", li);
        const span = document.createElement("span");
        console.log("span: ", span);

        li.appendChild(span);
        playerlist.appendChild(li);

        span.textContent = ein_player_name;
    
    });

    
    await startNewGame();

})

//Karten zur Liste hinzufügen
let i =0;
const li= document.createElement("li");
console.log("li: ", li);
const span=document.createElement("span");
console.log("span", span);
li.appendChild(span);
playerlist.appendChild(li);
span.textContent=result.Players[0].Cards[i].Color+" "+result.Players[0].Cards[i].Text;

async function startNewGame() {

    // hier starten wir gleich den request

    // warten auf das promise (alternativ fetch, then notation)

    //ladet die webseite von uno martin. hinten /api/game/start hinzufügen um ein neues spiel zu laden

    //wie auf der webseite

    response = await fetch("https://nowaunoweb.azurewebsites.net/api/Game/Start", {

        method: 'POST',

        //post verlangt 4 spieler als rückgabe wert wie in der dokumentation beschrieben

        body: JSON.stringify([

            "Player 1",

            "PLayer 2",

            "Player 3",

            "PLayer 4"

        ]

        ),

        headers: {

            'Content-type': 'application/json; charset=UTF-8',

        }

    });



    // dieser code wird erst ausgeführt wenn fetch fertig ist

    if (response.ok) { // wenn http-status zwischen 200 und 299 liegt

        // wir lesen den response body

        result = await response.json(); // alternativ response.text wenn nicht json gewünscht ist

        console.log(result);

    } else {

        alert("HTTP-Error: " + response.status);

    }

}
