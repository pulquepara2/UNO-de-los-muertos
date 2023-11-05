let gameId;
let playerList = [];
let playernames = [];
let currentPlayer;
let currentPlayerId;
let direction = 1;
let topCardValue;
let topCardColor;


let myModal = new bootstrap.Modal(document.getElementById('playerNames'));
let ColorchangeModal = new bootstrap.Modal(document.getElementById('ColorchangeModal'));

document.getElementById("startbutton").addEventListener("click", function () {
    myModal.show();
})

/*********************************************************/
// Spiel-Neustart
// setzt Namen, Spielerarry und Karten im Ui auf Null
/*********************************************************/
function reset() {
    playerList = [];
    playernames = [];
    direction = 1;
    removeCards("cards_player1");
    removeCards("cards_player2");
    removeCards("cards_player3");
    removeCards("cards_player4");
}


// formular submit abfangen
document.getElementById('playerNamesForm').addEventListener('submit', async function (evt) {
    //Startbutton variable
    let startbutton = document.getElementById('startbutton');

    console.log("Spieler hat Button 'Spiel starten' gedrückt!");
    // Formular absenden verhindern
    evt.preventDefault();

    reset();
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
    console.log(result);

    //setUpPlayers(result.Players);
    playerList = result.Players;
    console.log(playerList);
    setCurrentPlayerByName(result.NextPlayer);
    console.log("next player: " + currentPlayer.Player);

    displayPlayerNames();

    distributeCards(0, "cards_player1");
    distributeCards(1, "cards_player2");
    distributeCards(2, "cards_player3");
    distributeCards(3, "cards_player4");

    setTopCard(result.TopCard.Value, result.TopCard.Color);

    for (let i = 0; i < playerList.length; i++) {
        let score = playerList[i].Score;
        let h6 = document.getElementById("Score_" + i);
        h6.textContent = "Score: " + score;
    }

    displayDirection();
    showdrawpile();

    //Startbutton nach dem Spielstart entfernen
});


/***********************************************/
// überprüft, ob Namen unique sind
/***********************************************/

function hasDuplicates(array) {

    const lowerCaseNames = array.map(name => name.toLowerCase());

    return (new Set(lowerCaseNames)).size !== lowerCaseNames.length;

}

/***********************************************/
// Der Pfad und der String für die Kartenbilder
/***********************************************/

const CardsUrl = "./cardsimg/";

function buildSrcString(color, number) {
    return `${CardsUrl}${color + number}.png`;
}


/***********************************************/
// Zeigt die Spielernamen auf dem Spielfeld an
/***********************************************/

function displayPlayerNames() {
    for (let i = 0; i < playernames.length; i++) {
        document.getElementById('namePlayer' + (i + 1)).textContent = playernames[i];
    }
}

/********************************************************************
// Ermittelt den index des nächsten Spielers
/********************************************************************/
function getIndexOfPlayerByName(name) {
    for (let i = 0; i < playerList.length; i++) {
        if (name == playerList[i].Player) {
            return i;
        }
    }
};

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
/*********************************************************************************************/

function distributeCards(playerid, htmlid) {
    let playerlistHtml = document.getElementById(htmlid);
    let i = 0;
    while (i < playerList[playerid].Cards.length) {


        const img = document.createElement("img");

        const color = playerList[playerid].Cards[i].Color;

        const number = playerList[playerid].Cards[i].Value;

        img.src = buildSrcString(color, number);

        img.className = "card";

        img.addEventListener("click", image_clicked, false);

        img.CardColor = playerList[playerid].Cards[i].Color;

        img.Text = playerList[playerid].Cards[i].Text;

        img.CardValue = playerList[playerid].Cards[i].Value;

        img.CardScore = playerList[playerid].Cards[i].Score;

        img.playerId = playerid; //wird benötigt, um zu überprüfen, ob Karte vom currentplayer ist

        playerlistHtml.appendChild(img);

        i++;
    }

}


/***********************************************/
// Setzt die TopCard 
/***********************************************/

function setTopCard(value, color) {
    const TopCardImg = document.getElementById("TopCard");
    TopCardImg.src = buildSrcString(color, value);
    topCardColor = color;
    topCardValue = value;
}


/***********************************************/
//Zeigt das Bild des Abhebestapels an
/***********************************************/

function showdrawpile() {
    const drawpileimg = document.getElementById("Drawpile");
    drawpileimg.src = "./cardsimg/back0.png";
};


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
//wenn die Karte ungültig ist, wird eine Animation aufgerufen
/*****************************************************************************************************************/
async function image_clicked(ev) {
    if (!isValidCard(ev.target.playerId, ev.target.CardValue, ev.target.CardColor, ev.target.Text)) {
        // card is not valid, play shake animation and dont try to play card
        playAnimation(ev.target, "shake", 1000);
        return;
    }
    let wildColor = undefined;
    let color = ev.target.CardColor;
    let score = ev.target.CardScore;
    let isDrawCard = false;
    // handle color change
    //TODO: nicht Strings, sondern value vergleichen (Colorchange: Value= 14, Draw4: Value=13, beide haben Score von 50)
    if (ev.target.Text == 'ChangeColor' || ev.target.Text == 'Draw4') {
        wildColor = await handleColorChange();
    }
    if (ev.target.Text == 'Draw2' || ev.target.Text == 'Draw4') {
        isDrawCard = true;
    }
    if (ev.target.Text == 'Reverse') {
        direction *= -1;
        displayDirection();
        //  toggleSpinAnimationDirection();
    }


    tryToPlayCard(ev.target.CardValue, color, wildColor, isDrawCard,score);
};

function displayDirection() {
    if (direction == 1) {
        document.getElementById("directionImg").src = "others/direction_cw.png";
    }
    if (direction == -1) {
        document.getElementById("directionImg").src = "others/direction_ccw.png";
    }
}
/*function toggleSpinAnimationDirection() {
    if (document.getElementById("directionImg").classList.contains('spinRight')) {
        document.getElementById("directionImg").classList.remove('spinRight');
        document.getElementById("directionImg").classList.add('spinLeft');
    } else {
        document.getElementById("directionImg").classList.remove('spinLeft');
        document.getElementById("directionImg").classList.add('spinRight');
    }
}
*/
function updateScore(playerid, scoreofplayedcard){
    let score= 0;
    let cards= playerList[playerid].Cards;
    for(let i = 0; i< cards.length; i++){
        score = score + cards[i].Score;
    
    }
    score = score - scoreofplayedcard;
    document.getElementById("Score_"+playerid).textContent="Score: "+ score;
}

async function tryToPlayCard(value, color, wildColor, isDrawCard,score) {
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
        if (!cardPlayresult.error) {
            updateScore(currentPlayerId, score);
            removeCardFromPlayersHand(value, color);
            setTopCard(value, wildColor != undefined ? wildColor : color);
            // in case of Draw2/Draw4 call GetCards for the blocked player
            if (isDrawCard) {
                // in this case this is the blocked player
                let blockedPlayer = getNextPlayer();
                updatePlayerCards(blockedPlayer.Player);
            }
            
            setCurrentPlayer(cardPlayresult);
            

        }
        else {
            alert("Error: " + cardPlayresult.error);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}
/*******************************************************************************/
// Iteriert über das Kartenarray des SPielers und entfernt die gespielte KArte
// aktualisiert auch die Karten im UI
/***************************************************/
function removeCardFromPlayersHand(value, color) {
    //iterate over player cards and remove the played card
    let cardsOfCurrentPlayer = currentPlayer.Cards;
    for (let i = 0; i < cardsOfCurrentPlayer.length; i++) {
        if (value == cardsOfCurrentPlayer[i].Value && color == cardsOfCurrentPlayer[i].Color) {
            cardsOfCurrentPlayer.splice(i, 1); // remove 1 item starting at index i
            break
        }
    }
    updateHtml(currentPlayerId);
}
/***************************************************/
// entfernt alle Karten im HTML
// Teilt die aktualisierten Karten neu aus
/***************************************************/
function updateHtml(playerId) {
    // remove old cards
    removeCards("cards_player" + (playerId + 1));
    // draw new cards
    distributeCards(playerId, "cards_player" + (playerId + 1));
}

/***************************************************/
// anhand der html id wird der Card container gefunden
// und alle Child Elemente entfernt
/***************************************************/
function removeCards(htmlId) {
    const playerCardsElement = document.getElementById(htmlId);
    while (playerCardsElement.firstChild) {
        playerCardsElement.removeChild(playerCardsElement.firstChild);
    }
}
/***************************************************/
// Karte ziehen
// zum Kartenarray des Spielers hinzufügen
// currentPlayer aktualisieren
/***************************************************/
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
        //console.log(drawCardResult);
        if (!drawCardResult.error) {
            addCardToPlayersHand(drawCardResult.Card);
            setCurrentPlayerByName(drawCardResult.NextPlayer);  // Update the current player
        } else {
            alert("Error: " + drawCardResult.error);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

/***************************************************/
//Fügt die Karte dem Kartenarray des Spielers hinzu
//aktualisiert die Karten im UI
/***************************************************/
function addCardToPlayersHand(Card) {
    currentPlayer.Cards.push(Card);
    updateHtml(currentPlayerId);
}

/***************************************************************************************************/
// Prüft, ob gespielte Karte gültig ist
// Karte ist dann gültig, wenn sie dem current Player gehört UND die richtige Farbe ODER value hat
// ODER eine schwarze Actioncard ist
/***************************************************************************************************/

function isValidCard(playerId, value, color, text) {
    // check for +4
    if (text == 'Draw4') return checkDraw4();
    // card is valid when it belongs to the current player AND hast the right color OR value OR is a black wildcard 
    if (currentPlayerId == playerId && (color == topCardColor || value == topCardValue || color == 'Black')) return true;
    console.log("Invalid Card or Player!")
    return false;
}

/****************************************************************/
//Erstellt globale Variablen für den currentPlayer und seine ID
//ID = Index in der Playerlist
/****************************************************************/

function setCurrentPlayerByName(nextPlayer) {
    currentPlayerId = getIndexOfPlayerByName(nextPlayer);
    currentPlayer = playerList[currentPlayerId];
    console.log("updated currentplayer: " + currentPlayer.Player)
    displayCurrentPlayer();
}

/***************************************************/
//aktualisiert den Currentplayer und seine ID
/***************************************************/

function setCurrentPlayer(cardPlayresult) {
    currentPlayer = cardPlayresult;
    currentPlayerId = getIndexOfPlayerByName(currentPlayer.Player);
    // update player list with player from cardPlayresult
    playerList[currentPlayerId] = currentPlayer;
    console.log("updated currentplayer: " + currentPlayer.Player)
    displayCurrentPlayer();
}

function displayCurrentPlayer() {
    for (let i = 0; i < playerList.length; i++) {
        if (i == currentPlayerId) {
            document.getElementById("pointer_" + i).classList.remove("hidden");
        }
        else if (!document.getElementById("pointer_" + i).classList.contains("hidden")) {
            document.getElementById("pointer_" + i).classList.add("hidden");
        }
    }
}



/***************************************************/
//Animation, falls falsche Karte angeklickt wird
/***************************************************/

function playAnimation(target, animation, duration) {
    // add css class for animation
    target.classList.add(animation);
    // remove css class after duration
    setTimeout(function () { target.classList.remove(animation); }, duration);
}

/************************************************************/
// returniert ein Promise mit der ausgewählten Farbe
/************************************************************/

function handleColorChange() {
    ColorchangeModal.show();
    return new Promise(resolve => {
        document.getElementById("Red").addEventListener("click", function () {
            ColorchangeModal.hide();
            resolve("Red");
        })
        document.getElementById("Blue").addEventListener("click", function () {
            ColorchangeModal.hide();
            resolve("Blue");
        })
        document.getElementById("Green").addEventListener("click", function () {
            ColorchangeModal.hide();
            resolve("Green");
        })
        document.getElementById("Yellow").addEventListener("click", function () {
            ColorchangeModal.hide();
            resolve("Yellow");
        })
    });

    // call trytoplaycard method with corresponding wildcard
    //set wildcard as Topcard

}

/**********************************************************/
//Überprüft, ob der Spieler eine Zieh-4-Karte spielen darf
/**********************************************************/

function checkDraw4() {
    let cardsOfCurrentPlayer = currentPlayer.Cards;
    for (let i = 0; i < cardsOfCurrentPlayer.length; i++) {
        if (topCardValue == cardsOfCurrentPlayer[i].Value || topCardColor == cardsOfCurrentPlayer[i].Color) {
            return false;
        }
    }
    //falls der Spieler keine anderen gültigen Karten hat, return true
    return true;
}

/*******************************************************/
//Fügt die Karte dem Kartenarray des Spielers hinzu
/*******************************************************/
function getNextPlayer() {
    // use the modulo operator to stay withing the bounds of the array
    if (direction === 1) {
        return playerList[(currentPlayerId + 1) % playerList.length];
    } else {
        // add + playerList.length because javascript is stupid
        // and  doesnt handle modulo operator for negative numbers corretly
        return playerList[(currentPlayerId - 1 + playerList.length) % playerList.length];
    }
}
/**************************************************************/
//ruft die Karten und den Score des eingegeben Spielers ab
/*************************************************************/
async function updatePlayerCards(playerName) {
    let url = `https://nowaunoweb.azurewebsites.net/api/Game/GetCards/${gameId}?playerName=${playerName}`;

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        }
    });

    if (response.ok) {
        let getCardsResult = await response.json();
        console.log("got drawCard result:");
        //console.log(drawCardResult);
        if (!getCardsResult.error) {
            let playerId = getIndexOfPlayerByName(playerName);
            playerList[playerId] = getCardsResult;
            updateHtml(playerId);
        } else {
            alert("Error: " + getCardsResult.error);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}



