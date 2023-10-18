let result = Object();
/***********************************************/
// Modalen Dialog öffnen um Namen einzugeben
/***********************************************/

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


    await startNewGame();

    displayplayernames("playerName1", "Player1_name_and_cards");
    displayplayernames("playerName2", "Player2_name_and_cards");
    displayplayernames("playerName3", "Player3_name_and_cards");
    displayplayernames("playerName4", "Player4_name_and_cards");


    distributeCards(0, "cards_player1");
    distributeCards(1, "cards_player2");
    distributeCards(2, "cards_player3");
    distributeCards(3, "cards_player4");

});

/***********************************************/
// Die URL für die Karten
/***********************************************/

const CardsUrl = "https://nowaunoweb.azurewebsites.net/Content/Cards/";

function buildSrcString(color, number) {
    return `${CardsUrl}${color + number}.png`;
}

/***********************************************/
// Zeigt die Spielernamen auf dem Spielfeld an
/***********************************************/

function displayplayernames(htmlidname, htmlid_div) {

    let h3 = document.createElement("h3");
    let div = document.getElementById(htmlid_div)
    h3.textContent = document.getElementById(htmlidname).value
    div.insertBefore(h3, div.firstChild);

}

/***********************************************/
//Zeigt die Karten der Spieler an
/***********************************************/

function distributeCards(playerid, htmlid) {
    //alle Karten ausgeben
    playerlist = document.getElementById(htmlid);
    let i = 0;
    while (i < result.Players[playerid].Cards.length) {

        const li = document.createElement("li");

        const span = document.createElement("span");

        li.appendChild(span);
        playerlist.appendChild(li);
        /* span.textContent = "Card: "+
         result.Players[playerid].Cards[i].Text + " " +
         result.Players[playerid].Cards[i].Color;
 */
        //Image
        const img = document.createElement("img");
        const color = result.Players[playerid].Cards[i].Color.charAt(0);
        const number = result.Players[playerid].Cards[i].Value;
        img.src = buildSrcString(color, number);
        li.appendChild(img);
        i++;

    }
}

async function startNewGame() {


    // warten auf das promise (alternativ fetch, then notation)

    //ladet die webseite von uno martin. hinten /api/game/start hinzufügen um ein neues spiel zu laden

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

function showTopCard(){
    response = await fetch("https://nowaunoweb.azurewebsites.net/api/game/topCard", {
        method: 'GET',
        body
    )
}}