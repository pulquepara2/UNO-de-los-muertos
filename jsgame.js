/***********************************************/
// Globale Variablen
/***********************************************/
let gameId;
let playerList = [];
let playernames = [];
let nextPlayer;
let currentPlayer;
let currentPlayerId;
let direction = 1;
let topCardValue;
let topCardColor;

/***********************************************/
// Konstruktor-Funktion für die Spieler 
/***********************************************/

function Player(name, cards = [], score = 0) {
    this.Name = name;
    this.Cards = cards;
    this.Score = score;
}

/***********************************************/
// Konstruktor-Funktion für die Karten 
/***********************************************/
function Card(color, text, value, score) {
    this.Color = color;
    this.Text = text;
    this.Value = value;
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

    playernames = [player1Name, player2Name, player3Name, player4Name];
    console.log(playernames);

    myModal.hide();

    let result = await startNewGame();
    gameId = result.Id;

    setUpPlayers(result.Players);
    currentPlayer = playerList[getIndexOfPlayerByName(result.NextPlayer)]; 
    console.log("next player: " + currentPlayer.Name);

    displayplayernames("playerName1", "Player1_name_and_cards");
    displayplayernames("playerName2", "Player2_name_and_cards");
    displayplayernames("playerName3", "Player3_name_and_cards");
    displayplayernames("playerName4", "Player4_name_and_cards");

    distributeCards(0, "cards_player1");
    distributeCards(1, "cards_player2");
    distributeCards(2, "cards_player3");
    distributeCards(3, "cards_player4");

    setTopCard(result.TopCard.Value, result.TopCard.Color,);

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

function displayplayernames(htmlidname, htmlid_div) {

    let h3 = document.createElement("h4");
    let div = document.getElementById(htmlid_div)
    h3.textContent = document.getElementById(htmlidname).value
    div.insertBefore(h3, div.firstChild);
}

/********************************************************************/
//Erstellt vier Spielerobjekte mit den im Modal eingegebenen Namen
//und den von den Server bereitgestellen Karten und Score
/********************************************************************/

function setUpPlayers(Players) {

    for (let i = 0; i < Players.length; i++) {
        let player = Players[i];
        player.Name = playernames[i];
        playerList[i] = new Player(player.Name, player.Cards, player.Score);
    }
}

/********************************************************************
// Ermittelt den index des nächsten Spielers
/********************************************************************/
function getIndexOfPlayerByName(name) {
    for (let i = 0; i < playerList.length; i++) {
        if (name == playerList[i].Name) {
            return i;
        }
    }
};

/********************************************************************
// Erstellt globale Variablen für den currentPlayer und seine Id
// Id= Index in der playerList
/********************************************************************/

function setCurrentPlayer(nextPlayer) {
    currentPlayerId = getIndexOfPlayerByName(nextPlayer);
    currentPlayer = playerList[currentPlayerId];
    console.log("updated currentplayer: " + currentPlayer.Name)
}


/********************************************************************
// Ermittelt den index der gesuchten Karte
/********************************************************************/
function getIndexOfCard(playerindex, card) {
    for (let cardId = 0; cardId < playerList[playerindex].Cards.length; cardId++) {
        if (playerList[playerindex].Cards[cardId].Color === card.Color && playerList[playerindex].Cards[cardId].Value === card.Value) {
            return cardId;
        }
    }

}

/**********************************************************************************************/
//Zeigt die Karten der Spieler an, hier wird auch der Eventlistener für die Karten hinzugefügt
/**********************************************************************************************/

function distributeCards(playerid, htmlid) {
    let playerlistHtml = document.getElementById(htmlid);
    let i = 0;
    while (i < playerList[playerid].Cards.length) {

        const li = document.createElement("li");

        const span = document.createElement("span");

        li.appendChild(span);

        playerlistHtml.appendChild(li);

        const img = document.createElement("img");

        const color = playerList[playerid].Cards[i].Color;

        const number = playerList[playerid].Cards[i].Value;

        img.src = buildSrcString(color, number);

        img.className = "card";

        img.addEventListener("click", image_clicked, false);

        img.CardColor = playerList[playerid].Cards[i].Color;

        img.Text = playerList[playerid].Cards[i].Text;

        img.CardValue = playerList[playerid].Cards[i].Value;

        li.appendChild(img);

        i++;
    }

}


/***********************************************/
// Setzt die TopCard 
/***********************************************/

function setTopCard(value, color) {
    const TopCardImg = document.getElementById("TopCard");
    TopCardImg.src = buildSrcString(color, value);
}


/***********************************************/
//Zeigt das Bild des Abhebestapels an
/***********************************************/

function showdrawpile() {
    const drawpileimg = document.getElementById("Drawpile");
    drawpileimg.src = "./cardsimg/back0.png";
};

/*****************************************************/
//Übergibt die 4 Spielernamen, Spiel wird gestartet
/*****************************************************/

async function startNewGame() {

    // warten auf das promise (alternativ fetch, then notation)

    response = await fetch("https://nowaunoweb.azurewebsites.net/api/Game/Start", {

        method: 'POST',

        //post verlangt 4 spieler als rückgabe wert wie in der dokumentation beschrieben

        body: JSON.stringify(playernames),

        headers: {

            'Content-type': 'application/json; charset=UTF-8',
        }
    });

    if (response.ok) {

        // wir lesen den response body

        return await response.json(); // alternativ response.text wenn nicht json gewünscht ist        
    } else {

        alert("HTTP-Error: " + response.status);

    }
};


/*****************************************************************************************************************/
//hier wird die Funktion trytoplaycard aufgerufen und ihr werden Color und Value der angeklickten Karte übergeben
/*****************************************************************************************************************/
function image_clicked(ev) {

    tryToPlayCard(ev.target.CardValue, ev.target.CardColor);

};

async function tryToPlayCard(value, color) {
    let wildColor = "not used right now";

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
        if (!cardPlayresult.error) {
            console.log("Current Player: " + currentPlayer.Name);
            removeCardFromPlayersHand(value, color);
            setTopCard(value, color);
            currentPlayer = playerList[getIndexOfPlayerByName(cardPlayresult.Player)];  // Update the current player
            console.log("updated currentplayer: " + currentPlayer.Name)
            //draw2 : 2x drawcard()
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

function removeCardFromPlayersHand(value, color) {
    console.log(currentPlayer);
    let cardsOfCurrentPlayer = currentPlayer.Cards;
    console.log("Karten von " + currentPlayer.Name + " vor entfernen: " + cardsOfCurrentPlayer);
    for (let i = 0; i < cardsOfCurrentPlayer.length; i++) {
        if (value == cardsOfCurrentPlayer[i].Value && color == cardsOfCurrentPlayer[i].Color) {
            cardsOfCurrentPlayer.splice(i, 1); // remove 1 item starting at index i
        }
    }
    console.log("Karten von " + currentPlayer.Name + " nach entfernen: " + cardsOfCurrentPlayer);
    let playerIndex = getIndexOfPlayerByName(currentPlayer.Name);
    updateHtml(playerIndex);
}

function updateHtml(playerIndex) {
    // remove old cards
    removeCards("cards_player" + (playerIndex + 1));
    //draw new cards
    distributeCards(playerIndex, "cards_player" + (playerIndex + 1));
}

function removeCards(htmlId) {
    const playerCardsElement = document.getElementById(htmlId);
    while (playerCardsElement.firstChild) {
        playerCardsElement.removeChild(playerCardsElement.firstChild);
    }
}

async function drawCard() {
    let url = `https://nowaunoweb.azurewebsites.net/api/Game/drawCard/${gameId}`;

    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        }
    });

    if (response.ok) {
        let drawCardResult = await response.json();
        console.log("got drawCard result:");
        console.log(drawCardResult);
        if (!drawCardResult.error) {
            addCardToPlayersHand(drawCardResult.Card);
            currentPlayer = playerList[getIndexOfPlayerByName(drawCardResult.NextPlayer)];  // Update the current player
            console.log("updated currentplayer: " + currentPlayer.Name)
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

function addCardToPlayersHand(Card) {
    currentPlayer.Cards.push(Card);
    const playerIndex = getIndexOfPlayerByName(currentPlayer.Name);
    updateHtml(playerIndex);
}
