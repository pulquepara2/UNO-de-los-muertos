let result = Object();
let playerList = [];
let currentPlayer = Object();
let direction = 1;


/***********************************************/
// Konstruktor-Funktion für die Spieler 
/***********************************************/

function Player(name, cards = [], score = 0) {
    this.Name = name;
    this.Cards = cards;
    this.Score = score;
}

/***********************************************/
// Modalen Dialog öffnen, um Namen einzugeben
/***********************************************/


let myModal = new bootstrap.Modal(document.getElementById('playerNames'));
document.getElementById("startbutton").addEventListener("click", function () {

    myModal.show();
})


// formular submit abfangen
document.getElementById('playerNamesForm').addEventListener('submit', async function (evt) {
    //Startbutton variable
    let startbutton = document.getElementById('startbutton');

    console.log("Spieler hat Button 'Spiel starten' gedrückt!");
    // Formular absenden verhindern
    evt.preventDefault();


    let player1Name = document.getElementById("playerName1").value;

    let player2Name = document.getElementById("playerName2").value;

    let player3Name = document.getElementById("playerName3").value;

    let player4Name = document.getElementById("playerName4").value;

    // Check for empty fields

    if (player1Name == "" || player2Name == "" || player3Name == "" || player4Name == "") {

        alert('Please fill in all fields.');

        return; // Stop form submission
    }

    // Check for duplicate names

    if (hasDuplicates([player1Name, player2Name, player3Name, player4Name])) {

        alert('Please enter unique names. The same name cannot be used more than once.'); return; // Stop form submission

    }

    //if successful, save names in the player list array

    playerList = [document.getElementById("playerName1").value, document.getElementById("playerName2").value, document.getElementById("playerName3").value, document.getElementById("playerName4").value];

    myModal.hide();
    await startNewGame();
    
    setUpPlayers();

    displayplayernames("playerName1", "Player1_name_and_cards");
    displayplayernames("playerName2", "Player2_name_and_cards");
    displayplayernames("playerName3", "Player3_name_and_cards");
    displayplayernames("playerName4", "Player4_name_and_cards");

    distributeCards(0, "cards_player1");
    distributeCards(1, "cards_player2");
    distributeCards(2, "cards_player3");
    distributeCards(3, "cards_player4");

    showFirstTopCard();
    showdrawpile();

    //Startbutton nach dem Spielstart entfernen
    startbutton.style.display = 'none';
});


/***********************************************/
// überprüft, ob Namen unique sind
/***********************************************/

function hasDuplicates(array) {

    const lowerCaseNames = array.map(name => name.toLowerCase());

    return (new Set(lowerCaseNames)).size !== lowerCaseNames.length;

}

/***********************************************/
// Der Pfad und der String für die Karten
/***********************************************/

const CardsUrl = "./cardsimg/";

function buildSrcString(color, number) {
    return `${CardsUrl}${color + number}.png`;
}


/***********************************************/
// Zeigt die Spielernamen auf dem Spielfeld an
/***********************************************/

async function displayplayernames(htmlidname, htmlid_div) {

    let h3 = document.createElement("h4");
    let div = document.getElementById(htmlid_div)
    h3.textContent = document.getElementById(htmlidname).value
    div.insertBefore(h3, div.firstChild);
}

/********************************************************************/
//Erstellt vier Spielerobjekte
/********************************************************************/

async function setUpPlayers() {
    for (let i = 0; i < result.Players.length; i++) {
        let player = result.Players[i];
        playerList[i] = new Player(player.Player, player.Cards, player.Score);
    }
   

}

/********************************************************************/
// Ermittelt den index des aktuellen Spielers
/********************************************************************/
function getIndexOfCurrentPlayer(response) {
    for (let playerIndex = 0; playerIndex <= 3; playerIndex++) {
        if (response.Player === playerList[playerIndex].Name) {
            return playerIndex;
        }
    }
};


/**********************************************************************************************/
//Zeigt die Karten der Spieler an, hier wird auch der Eventlistener für die Karten hinzugefügt
/*********************************************************************************************/

async function distributeCards(playerid, htmlid) {
    let playerlist = document.getElementById(htmlid);
    let i = 0;
    while (i < result.Players[playerid].Cards.length) {

        const li = document.createElement("li");

        const span = document.createElement("span");

        li.appendChild(span);

        playerlist.appendChild(li);

        const img = document.createElement("img");

        const color = result.Players[playerid].Cards[i].Color;

        const number = result.Players[playerid].Cards[i].Value;

        img.src = buildSrcString(color, number);

        img.className = "card";

        img.addEventListener("click", image_clicked, false);

        img.CardColor = result.Players[playerid].Cards[i].Color;

        img.Text = result.Players[playerid].Cards[i].Text;

        img.CardValue = result.Players[playerid].Cards[i].Value;

        li.appendChild(img);

        i++;
    }

}


/***********************************************/
//Zeigt die erste TopCard des Spiels an
/***********************************************/

async function showFirstTopCard() {
    const TopCardImg = document.createElement("img");
    const topCardColor = result.TopCard.Color;
    const topCardNumber = result.TopCard.Value;
    TopCardImg.src = buildSrcString(topCardColor, topCardNumber);
    TopCardImg.id = "TopCard"
    let imgdiv = document.getElementById("TopCardImg");
    imgdiv.appendChild(TopCardImg);
    console.log(TopCardImg);
}


/***********************************************/
//Zeigt das Bild des Abhebestapels an
/***********************************************/

async function showdrawpile() {
    const drawpileimg = document.createElement("img");
    drawpileimg.src = "./cardsimg/back0.png";
    drawpileimg.id = "Drawpile";
    let div = document.querySelector(".Drawpile");
    div.appendChild(drawpileimg);
};


async function startNewGame() {

    // warten auf das promise (alternativ fetch, then notation)

    response = await fetch("https://nowaunoweb.azurewebsites.net/api/Game/Start", {

        method: 'POST',

        //post verlangt 4 spieler als rückgabe wert wie in der dokumentation beschrieben

        body: JSON.stringify(playerList),

        headers: {

            'Content-type': 'application/json; charset=UTF-8',
        }
    });

    if (response.ok) {

        // wir lesen den response body

        result = await response.json(); // alternativ response.text wenn nicht json gewünscht ist
        currentPlayer = result.NextPlayer;
        console.log("current player: " + currentPlayer);
        console.log(result);

    } else {

        alert("HTTP-Error: " + response.status);

    }
};


/*****************************************************************************************************************/
//hier wird die Funktion trytoplaycard aufgerufen und ihr werden Color und Value der angeklickten Karte übergeben
/*****************************************************************************************************************/
async function image_clicked(ev) {

    tryToPlayCard(ev.target.CardColor, ev.target.CardValue);

};

async function tryToPlayCard(value, color) {
    let wildColor = "not used right now";
    let gameId = result.Id;

    let url = `https://nowaunoweb.azurewebsites.net/api/Game/PlayCard/${gameId}?value=${value}&color=${color}&wildColor=${wildColor}`;

    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        }

    });

    if (response.ok) {
        let cardPlayresult = await response.json();
        console.log("got cardplayresult:");
        console.log(cardPlayresult);
    }
    else {

        alert("HTTP-Error: " + response.status);

    }
};


function removeCardFromPlayersHand() {

}

function updateTopCard() {

}

