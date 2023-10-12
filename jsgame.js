let result=Object();

let myModal = new bootstrap.Modal(document.getElementById('playerNames'));
document.getElementById("startbutton").addEventListener("click", function(){
    
    myModal.show();
})


async function load(){

    // hier starten wir gleich den request

    // warten auf das promise (alternativ fetch, then notation)

 

    //ladet die webseite von uno martin. hinten /api/game/start hinzufügen um ein neues spiel zu laden

    //wie auf der webseite

    let response = await fetch("https://nowaunoweb.azurewebsites.net/api/Game/Start",{

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

    if(response.ok){ // wenn http-status zwischen 200 und 299 liegt

        // wir lesen den response body

        result = await response.json(); // alternativ response.text wenn nicht json gewünscht ist

        console.log(result);

        alert(JSON.stringify(result));

    }else{

        alert("HTTP-Error: " + response.status);

    }

}

// hier rufen wir unsere asynchrone funktion auf

load();
