import Nutzer from '../../model/Nutzer.mjs';
import Einlagerer from "../../model/Einlagerer.mjs";
import Werkstatt from "../../model/Werkstatt.mjs";
import Lagerhalter from "../../model/Lagerhalter.mjs";

let loggedInUser: Nutzer | null = null;


/**
 * Adds an event listener for the 'DOMContentLoaded' event.
 */
document.addEventListener("DOMContentLoaded", function () {
    const bodyElement = document.body;

    // Login/Register Page---------------------------------------------------------------------------------------------
    if (bodyElement.classList.contains("mainpage")) {

        /**
         * Adds an event listener for the 'submit' event on the register form to handle user registration.
         * @param {Event} event - The submit event.
         */
        document.getElementById('registerForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (event.submitter && event.submitter.classList.contains('action-button')) {

                let formData = new FormData(event.target as HTMLFormElement);
                let userData: { [key: string]: string } = {};

                formData.forEach((value, key) => {
                    userData[key] = value as string;
                });

                //Fetch next available userID
                const response = await fetch('http://localhost:3000/nextID');
                const data = await response.json();
                const nextFreeID = data.nextFreeID;

                //DEBUG
                //console.log(data);
                //console.log(nextFreeID);

                let newUser = Nutzer.createUser(nextFreeID, userData.email, userData.password, userData.firstName,
                    userData.lastName, userData.phonenumber, userData.city, userData.plz, userData.street, userData.hnr,);

                //DEBUG
                //console.log(newUser);
                //console.log(userData.accountType);

                if (userData.accountType == "Einlagerer") {
                    newUser.setKontotyp(Einlagerer.createEinlagerer(newUser));
                } else if (userData.accountType == "Lagerhalter") {
                    newUser.setKontotyp(Lagerhalter.createLagerhalter(newUser));
                } else if (userData.accountType == "Werkstatt") {
                    newUser.setKontotyp(Werkstatt.createWerkstatt(newUser));
                }

                try {
                    console.log(JSON.stringify(newUser));
                    let response = await fetch('http://localhost:3000/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newUser)
                    });

                    if (response.ok) {
                        alert('Registrierung erfolgreich');
                        document.getElementById('loginForm').style.display = 'block';
                        document.getElementById('registerForm').style.display = 'none';
                        document.getElementById('registerButton').style.display = 'none';
                        document.getElementById('loginButton').style.display = 'none';
                    } else if (response.status == 400) {
                        alert('Konto mit dieser E-Mail existiert bereits!');
                    } else {
                        alert('Registrierung fehlgeschlagen');
                    }
                } catch (error) {
                    console.error('Fehler bei der Registrierung:', error);
                }
            }
        });

        /**
         * Adds an event listener for the 'submit' event on the login form to handle user login.
         * @param {Event} event - The submit event.
         */
        document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (event.submitter && event.submitter.classList.contains('action-button')) {

                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                try {
                    const response = await fetch('http://localhost:3000/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        let userData = await response.json();

                        //User from JSON
                        let user = Nutzer.fromJson(userData);

                        loggedInUser = user;
                        sessionStorage.setItem('loggedInUser', JSON.stringify(user));

                        console.log(userData);
                        console.log(userData.einlagererUserID);
                        console.log(userData.lagerhalterUserID);
                        console.log(userData.werkstattUserID);

                        if (userData.einlagererUserID != null) {
                            user.setKontotyp(Einlagerer.createEinlagerer(user));
                            window.location.href = 'einlagerer-dashboard.html';
                        } else if (userData.lagerhalterUserID != null) {
                            user.setKontotyp(Lagerhalter.createLagerhalter(user));
                            window.location.href = 'lagerhalter-dashboard.html';
                        } else if (userData.werkstattUserID != null) {
                            user.setKontotyp(Werkstatt.createWerkstatt(user));
                            window.location.href = 'werkstatt-dashboard.html';
                        }

                    } else if (response.status == 401) {
                        alert('Ungültige Anmeldeinformationen. Überprüfen Sie bitte Ihre E-Mail und Ihr Passwort.');
                    }
                } catch (error) {
                    console.error('Error during login:', error);
                }
            }
        });

        /**
         * Adds click event listeners to display the login form when the login button is clicked.
         */
        document.getElementById('loginButton').addEventListener('click', function () {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('registerButton').style.display = 'none';
            document.getElementById('loginButton').style.display = 'none';
        });

        /**
         * Adds click event listeners to display the register form when the register button is clicked.
         */
        document.getElementById('registerButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('registerButton').style.display = 'none';
            document.getElementById('loginButton').style.display = 'none';
        });

        /**
         * Adds click event listeners to display the login/register selection when back buttons are clicked.
         */
        document.querySelectorAll('.back-button').forEach(function (button) {
            button.addEventListener('click', function () {
                document.getElementById('title').style.display = 'block';
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'none';
                document.getElementById('registerButton').style.display = 'inline-block';
                document.getElementById('loginButton').style.display = 'inline-block';
            });
        });


    }
    /**
     * Einlagerer Page
     */
    else if (bodyElement.classList.contains("einlagerer")) {
        /**
         * Retrieves the logged-in user from session storage and displays a welcome message.
         */
        loggedInUser = Nutzer.fromJson(JSON.parse(sessionStorage.getItem('loggedInUser')));
        const welcomeElement = document.getElementById("welcome");
        welcomeElement.textContent = "Hallo " + loggedInUser.getVorname() + ", was möchtest du tun?";

        /**
         * Adds a click event listener to show the "Stellplatz suchen" form when the corresponding button is clicked.
         */
        document.getElementById('stellplatzSuchenButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplatzSuchenButton').style.display = 'none';
            document.getElementById('angeboteVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'none';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('stellplatzSucheForm').style.display = 'block';

            fetchStaedte();
            fetchMarken();
        });

        /**
         * Adds a submit event listener to the "Stellplatz suchen" form for handling form submission.
         */
        document.getElementById('stellplatzSucheForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {

                //Processes the form data and sends a request to fetch and display parking spaces based on user input.
                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                console.log(data)
                try {
                    const response = await fetch('http://localhost:3000/stellplatzsuche', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {
                        document.getElementById('stellplatzSucheForm').style.display = 'none';

                        document.getElementById('stellplatzSucheErgebnisForm').style.display = 'block';

                        const selectedCity = document.getElementById('stadtSelect') as HTMLSelectElement;
                        const smallTitle = document.getElementById('stellplatzSucheErgebnisSmallTitle');
                        if (selectedCity.value == "%") {
                            smallTitle.textContent = `Stellplätze in beliebigen Städten`;
                        } else {
                            smallTitle.textContent = `Stellplätze in ${selectedCity.value}`;
                        }

                        let stellplatzinfo = await response.json();
                        console.log(stellplatzinfo);

                        // Groups the results by categoryID and displays the parking space information.
                        const results = stellplatzkatgorieGetLagerbedingungen(stellplatzinfo.stellplaetze);
                        console.log(results);
                        displayStellplatzInfo(results);


                    } else {
                        alert("Error beim finden der Stellplätze");
                        console.error('Error fetching stellplatz daten:', response.status);
                    }
                } catch (error) {
                    console.error('Error during Stellplatzsuche:', error);
                }
            }
        });

        /**
         * Adds a submit event listener to the "Stellplatz suchen" result detail form for handling form submission.
         */
        document.getElementById('stellplatzSucheDetailForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {

                // Processes the form data and sends a request to send an offer request for the selected parking space.
                const form = event.target as HTMLFormElement;
                const elementWithAttribute = form.querySelector('[class="detail-result"]');
                const kategorieid = elementWithAttribute?.getAttribute('data-kategorieid');

                const requestBody = {
                    kategorieid: kategorieid,
                    loggedInUser: loggedInUser
                };

                try {
                    const response = await fetch('http://localhost:3000/sendAngebotsanfrage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if (response.ok) {
                        alert("Angebot wurde erfolgreich angefordert!");

                        document.getElementById('stellplatzSucheErgebnisForm').style.display = 'block';
                        document.getElementById('stellplatzSucheDetailForm').style.display = 'none';

                        document.getElementById('stellplatzSucheDetailErgebnis').innerText = " ";

                    } else {
                        alert("Error beim senden eines Angebots");
                        console.error('Error beim senden eines Angebots:', response.status);
                    }
                } catch (error) {
                    console.error('Error beim senden eines Angebots:', error);
                }
            }
        });

        /**
         * Adds a click event listener to the "Stellplatz suchen" form back button for returning to the main Einlagerer page.
         */
        document.getElementById('stellplatzSucheBackButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplatzSuchenButton').style.display = 'block';
            document.getElementById('angeboteVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('stellplatzSucheForm').style.display = 'none';
        });

        /**
         * Adds a click event listener to the "Stellplatz suchen" result form back button for returning to the search form.
         */
        document.getElementById('stellplatzSucheErgebnisBackButton').addEventListener('click', function () {
            document.getElementById('stellplatzSucheForm').style.display = 'block';
            document.getElementById('stellplatzSucheErgebnisForm').style.display = 'none';

            document.getElementById('stellplatzSucheErgebnis').innerText = " ";

        });

        /**
         * Adds a click event listener to the "Stellplatz suchen" result detail form back button for returning to the result form.
         */
        document.getElementById('stellplatzSucheDetailBackButton').addEventListener('click', function () {
            document.getElementById('stellplatzSucheErgebnisForm').style.display = 'block';
            document.getElementById('stellplatzSucheDetailForm').style.display = 'none';

            document.getElementById('stellplatzSucheDetailErgebnis').innerText = " ";
        });

        /**
         * Adds a click event listener to the "Angebote verwalten" button for displaying and managing the user's offers.
         */
        document.getElementById('angeboteVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplatzSuchenButton').style.display = 'none';
            document.getElementById('angeboteVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'none';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('angeboteVerwaltenForm').style.display = 'block';
            document.getElementById('angeboteVerwaltenResultForm').style.display = 'block';

            try {
                console.log(JSON.stringify(loggedInUser));
                let response = await fetch('http://localhost:3000/getAngebote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if (response.ok) {
                    let angebote = await response.json();
                    console.log(angebote);
                    displayAngebote(angebote);
                } else {
                    alert('Fehler beim erhalten der Angebote');
                }
            } catch (error) {
                console.error('Fehler beim erhalten der Angebote:', error);
            }
        });


        /**
         * Adds a submit event listener to the "Angebot ablehnen" button.
         */
        document.getElementById('angebotAnnehmenAblehnenForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('delete-button')) {
                // get angebotID
                const form = event.target as HTMLFormElement;
                const elementWithAttribute = form.querySelector('[class="detail-result"]');
                const angebotid = elementWithAttribute?.getAttribute('data-angebotid');
                //console.log(angebotid);

                try {
                    let response = await fetch('http://localhost:3000/deleteAngebot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({angebotid})
                    });

                    if (response.ok) {
                        alert("Angebot wurde gelöscht");
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplatzSuchenButton').style.display = 'block';
                        document.getElementById('angeboteVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
                        document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
                        document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';


                        document.getElementById('angebotAnnehmenAblehnenForm').style.display = 'none';

                        document.getElementById('angeboteVerwaltenResultForm').innerText = ' ';
                        document.getElementById('angebotAnnehmenAblehnenErgebnis').innerText = ' ';

                    } else {
                        alert('Fehler beim ablehnen des Angebots');
                    }
                } catch (err) {
                    console.error('Fehler beim löschen des Angebots:', err);
                }
            }
        });

        /**
         * Adds a submit event listener to the "Angebot annehmen" button.
         */
        document.getElementById('angebotAnnehmenAblehnenForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {
                // AngebotID aus Ergebnis holen
                const form = event.target as HTMLFormElement;
                const elementWithAttribute = form.querySelector('[class="detail-result"]');
                const angebotid = elementWithAttribute?.getAttribute('data-angebotid');
                const fahrzeugMarke = (form.querySelector('[id="angebotAnnehmenMarkeText"]') as HTMLInputElement).value;
                const fahrzeugModell = (form.querySelector('[id="angebotAnnehmenModellText"]') as HTMLInputElement).value;

                const requestBody = {
                    angebotid: angebotid,
                    fahrzeugMarke: fahrzeugMarke,
                    fahrzeugModell: fahrzeugModell,
                    loggedInUser: loggedInUser
                }

                try {
                    let response = await fetch('http://localhost:3000/acceptAngebot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (response.ok) {
                        /**
                         * Resets the page after completing an action, making the main Einlagerer page elements visible again.
                         */
                        alert("Fahrzeug wurde mit entsprechendem Stellplatz registriert");
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplatzSuchenButton').style.display = 'block';
                        document.getElementById('angeboteVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
                        document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
                        document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';

                        document.getElementById('angebotAnnehmenAblehnenForm').style.display = 'none';

                        document.getElementById('angeboteVerwaltenResultForm').innerText = ' ';
                        document.getElementById('angebotAnnehmenAblehnenErgebnis').innerText = ' ';

                        try {
                            let response = await fetch('http://localhost:3000/deleteAcceptedAngebot', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({angebotid})
                            });

                            if (response.ok) {
                                console.log("Angebot wurde gelöscht")

                            } else {
                                alert('Fehler beim löschen des akzeptierten Angebots');
                            }
                        } catch (err) {
                            console.error('Fehler beim löschen des akzeptierten Angebots:', err);
                        }
                    }
                    else {
                        alert('Fehler beim annehmen des Angebots');
                    }
                } catch (err) {
                    console.error('Fehler beim annehmen des Angebots:', err);
                }
            }
        });

        /**
         * Adds a click event listener to the "Back" button in the "Angebot annehmen/ablehnen" section, allowing users to go back to the "Angebote verwalten" section.
         */
        document.getElementById('angebotAnnehmenAblehnenBackButton')?.addEventListener('click', function () {
            document.getElementById('angeboteVerwaltenForm').style.display = 'block';
            document.getElementById('angebotAnnehmenAblehnenForm').style.display = 'none';

            document.getElementById('angebotAnnehmenAblehnenErgebnis').innerText = ' ';
        });


        /**
         * Adds a click event listener to the "Fahrzeuge verwalten" button for displaying and managing the user's registered cars.
         */
        document.getElementById('fahrzeugeVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplatzSuchenButton').style.display = 'none';
            document.getElementById('angeboteVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'none';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('fahrzeugeVerwaltenListeForm').style.display = 'block';
            document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').style.display = 'block';

            // Display Fahrzeugliste
            try {
                const response = await fetch('http://localhost:3000/getFahrzeugInfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if (response.ok) {
                    let fahrzeugListe = await response.json();
                    console.log(fahrzeugListe);
                    displayRegisteredCars(fahrzeugListe);
                } else {
                    alert('Fehler beim Listen der Fahrzeuge');
                }
            } catch (error) {
                console.error('Fehler bei: ', error);
            }
        });


        /**
         * Adds a click event listener to the "Back" button in the "Fahrzeuge verwalten" section, allowing users to go back to the main Einlagerer page.
         */
        document.getElementById('fahrzeugeVerwaltenListeBackButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplatzSuchenButton').style.display = 'block';
            document.getElementById('angeboteVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('fahrzeugVerwaltenForm').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenListeForm').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').style.display = 'none';

            document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').innerText = " ";
        });

        /**
         * Adds a click event listener to the "Back" button in the "Fahrzeug verwalten" section, allowing users to go back to the main Einlagerer page.
         */
        document.getElementById('fahrzeugVerwaltenBackButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplatzSuchenButton').style.display = 'block';
            document.getElementById('angeboteVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
            document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
            document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('fahrzeugVerwaltenForm').style.display = 'none';
            document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').innerText = " ";

        });

        /**
         * Adds a submit event listener to the "Fahrzeug verwalten" form, allowing users to update information about a registered vehicle.
         * @param {Event} event - The submit event
         */
        document.getElementById('fahrzeugVerwaltenForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {
                console.log("test");
                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                data["fahrzeugid"] = document.getElementById('fahrzeugVerwaltenFahrzeugInfoForm').getAttribute('data-fahrzeugid');

                console.log(data);

                const requestBody = {
                    data: data,
                    loggedInUser: loggedInUser
                };

                console.log(requestBody);

                try {
                    const response = await fetch('http://localhost:3000/setFahrzeugInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),

                    });

                    if(response.ok) {
                        alert('Fahrzeuginformationen gesetzt');
                        document.getElementById('fahrzeugVerwaltenForm').style.display = 'none';
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplatzSuchenButton').style.display = 'block';
                        document.getElementById('angeboteVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzserviceBuchenButton').style.display = 'block';
                        document.getElementById('fahrzeugeVerwaltenButton').style.display = 'block';
                        document.getElementById('einlagererAnfragenVerwaltenButton').style.display = 'block';
                        document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').innerText = " ";
                    }
                    else {
                        console.error('Fehler beim setzen der Fahrzeuginformationen');
                    }
                } catch (error) {
                    console.error('Error during Fahrzeug verwalten:', error);
                }
            }
        });
    }

    /**
     * Adds a click event listener to the "Lager verwalten" button on the Lagerhalter page.
     * Displays the Lager verwalten form and fetches Lager information for the logged-in user.
     * @param {Event} event - The click event
     */
    else if (bodyElement.classList.contains("lagerhalter")) {
        loggedInUser = Nutzer.fromJson(JSON.parse(sessionStorage.getItem('loggedInUser')));
        const welcomeElement = document.getElementById("welcome");
        welcomeElement.textContent = "Hallo " + loggedInUser.getNachname() + ", was möchten sie tun?";

        // Lager verwalten ---------------------
        document.getElementById('lagerVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'none';
            document.getElementById('lagerVerwaltenButton').style.display = 'none';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('lagerVerwaltenForm').style.display = 'block';

            await fetchMarken();
            await fetchStaedte();

            try {
                console.log(JSON.stringify(loggedInUser));
                let response = await fetch('http://localhost:3000/getLagerinfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if (response.ok) {
                    let userData = await response.json();
                    console.log(userData);
                    let lagerhalter = Lagerhalter.createLagerhalter(loggedInUser);
                    lagerhalter.getStorage().setLagerDaten(userData.lager.spezHersteller, userData.lager.servicezeiten, userData.lager.plz, userData.lager.stadt, userData.lager.hnr, userData.lager.strasse);
                    console.log(lagerhalter.getStorage());

                    (document.getElementById('lagerDatenInfoHausnummer') as HTMLInputElement).value = lagerhalter.getStorage().getHNR();
                    (document.getElementById('lagerDatenInfoPostleitzahl') as HTMLInputElement).value = lagerhalter.getStorage().getPLZ();
                    (document.getElementById('lagerDatenInfoStrasse') as HTMLInputElement).value = lagerhalter.getStorage().getStrasse();
                    (document.getElementById('lagerDatenInfoServicezeiten') as HTMLInputElement).value = lagerhalter.getStorage().getServiceZeiten();
                    (document.getElementById('stadtSelect') as HTMLInputElement).value = lagerhalter.getStorage().getStadt();
                    (document.getElementById('markenSelect') as HTMLSelectElement).value = lagerhalter.getStorage().getSpezHersteller();
                } else {
                    alert('Fehler beim finden der Lagerinfo');
                }
            } catch (error) {
                console.error('Fehler beim finden der Lagerinfo:', error);
            }
        });

        /**
         * Adds a click event listener to the "Lager verwalten" back button.
         * Displays the main elements on the Lagerhalter page and hides the Lager verwalten form.
         * @param {Event} event - The click event
         */
        document.getElementById('lagerVerwaltenBackButton')?.addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
            document.getElementById('lagerVerwaltenButton').style.display = 'block';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('lagerVerwaltenForm').style.display = 'none';
        });

        /**
         * Adds a submit event listener to the "Lager verwalten" form.
         * Handles the form submission to set Lagerinformationen.
         * @param {Event} event - The submit event
         */
        document.getElementById('lagerVerwaltenForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {

                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                const requestBody = {
                    data: data,
                    loggedInUser: loggedInUser
                };

                console.log(requestBody);

                try {
                    const response = await fetch('http://localhost:3000/setLagerinfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if (response.ok) {
                        alert("Lagerinformationen gesetzt");
                        document.getElementById('lagerVerwaltenForm').style.display = 'none';
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

                    } else {
                        alert("Error beim setzen der Lagerinformation");
                        console.error('Error setting Lager data:', response.status);
                    }
                } catch (error) {
                    console.error('Error during Lager verwalten:', error);
                }
            }
        });

        /**
         * Adds a click event listener to the "Zusatz-Services verwalten" button.
         * Displays the Zusatz-Services management forms and hides the main elements on the Lagerhalter page.
         * Fetches and displays existing Zusatz-Services information.
         */
        document.getElementById('zusatzservicesVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'none';
            document.getElementById('lagerVerwaltenButton').style.display = 'none';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('zusatzServiceResultForm').style.display = 'block';
            document.getElementById('zusatzVerwaltenForm').style.display = 'block';

            try {
                console.log(JSON.stringify(loggedInUser));
                let response = await fetch('http://localhost:3000/getServices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if (response.ok) {
                    let serviceInfo = await response.json();
                    console.log(serviceInfo);
                    displayZusatzServices(serviceInfo);

                } else {
                    alert('Fehler beim');
                }
            } catch (error) {
                console.error('Fehler bei:', error);
            }

        });

        /**
         * Adds a submit event listener to the "Neuer Service anbieten" form.
         * Handles the form submission to offer a new Zusatz-Service.
         * @param {Event} event - The submit event
         */
        document.getElementById('neuerServiceForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {

                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                const requestBody = {
                    data: data,
                    loggedInUser: loggedInUser
                };

                console.log(requestBody);

                try {
                    const response = await fetch('http://localhost:3000/newService', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if (response.ok) {
                        alert("Neuer Service wird nun angeboten");
                        document.getElementById('neuerServiceForm').style.display = 'none';
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

                        document.getElementById('zusatzServiceResultForm').innerText = " ";
                    } else {
                        alert("Error beim anbieten des neuen Zusatz-Service");
                        console.error('Error beim anbieten des neuen Zusatz-Service:', response.status);
                    }
                } catch (error) {
                    console.error('Error beim anbieten des neuen Zusatz-Service:', error);
                }
            }
        });

        /**
         * Adds a click event listener to the "Neuer Service" button.
         * Displays the form for offering a new Zusatz-Service and hides other elements.
         */
        document.getElementById('neuerServiceButton').addEventListener('click', async function () {
            event.preventDefault();
            document.getElementById('zusatzServiceResultForm').style.display = 'none';
            document.getElementById('zusatzVerwaltenForm').style.display = 'none';

            document.getElementById('neuerServiceForm').style.display = 'block';
        });

        /**
         * Adds a click event listener to the "Zusatz-Services verwalten" back button.
         * Displays the main elements on the Lagerhalter page and hides the Zusatz-Services management form.
         */
        document.getElementById('zusatzVerwaltenBackButton')?.addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
            document.getElementById('lagerVerwaltenButton').style.display = 'block';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('zusatzVerwaltenForm').style.display = 'none';
            document.getElementById('zusatzServiceResultForm').style.display = 'none';

            document.getElementById('zusatzServiceResultForm').innerText = " ";
        });

        /**
         * Adds a click event listener to the "Neuer Service" back button.
         * Displays the main elements on the Lagerhalter page and hides the form for offering a new Zusatz-Service.
         */
        document.getElementById('neuerServiceBackButton')?.addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
            document.getElementById('lagerVerwaltenButton').style.display = 'block';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('neuerServiceForm').style.display = 'none';
            document.getElementById('zusatzServiceResultForm').innerText = " ";
        });

        /**
         * Adds a click event listener to the "Lagerhalter Anfragen verwalten" button.
         * Displays the Lagerhalter Anfragen management forms and hides other elements on the Lagerhalter page.
         * Fetches and displays unique Anfragen information.
         */
        document.getElementById('lagerhalterAnfragenVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('stellplaetzeVerwaltenButton').style.display = 'none';
            document.getElementById('zusatzservicesVerwaltenButton').style.display = 'none';
            document.getElementById('lagerVerwaltenButton').style.display = 'none';
            document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('lagerhalterAnfragenVerwaltenForm').style.display = 'block';
            document.getElementById('lagerhalterAnfrageResultForm').style.display = 'block';


            try {
                console.log(JSON.stringify(loggedInUser));
                let response = await fetch('http://localhost:3000/getUniqueAnfragen', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if (response.ok) {
                    let anfragen = await response.json();
                    console.log(anfragen);
                    displayAngebotsAnfragen(anfragen);
                } else {
                    alert('Fehler beim erhalten der Anfragen');
                }
            } catch (error) {
                console.error('Fehler beim erhalten der Anfragen:', error);
            }

        });


        /**
         * Adds a submit event listener to the "Lagerhalter Anfrage Detail" form for deleting an Anfrage.
         * Deletes the Anfrage based on the selected AnfrageID and displays appropriate messages.
         * @param {Event} event - The submit event
         */
        document.getElementById('lagerhalterAnfrageDetailForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('delete-button')) {
                // get AnfrageID
                const form = event.target as HTMLFormElement;
                const elementWithAttribute = form.querySelector('[class="detail-result"]');
                const anfrageid = elementWithAttribute?.getAttribute('data-anfrageid');
                //console.log(anfrageid);

                                try {
                                    let response = await fetch('http://localhost:3000/deleteAnfrage', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({anfrageid})
                                    });

                                    if (response.ok) {
                                        alert("Anfrage wurde gelöscht");
                                        document.getElementById('title').style.display = 'block';
                                        document.getElementById('welcome').style.display = 'block';
                                        document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
                                        document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
                                        document.getElementById('lagerVerwaltenButton').style.display = 'block';
                                        document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

                                        document.getElementById('lagerhalterAnfrageDetailForm').style.display = 'none';

                                        document.getElementById('lagerhalterAnfrageDetailErgebnis').innerText = ' ';
                                        document.getElementById('lagerhalterAnfrageResultForm').innerText = ' ';

                                    } else {
                                        alert('Fehler beim löschen der Anfragen');
                                    }
                                } catch (err) {
                                    console.error('Fehler beim löschen der Anfragen:', err);
                                }
            }
        });

        /**
         * Adds a submit event listener to the "Lagerhalter Anfrage Detail" form for sending an Angebot.
         * Sends an Angebot in response to the selected Anfrage and displays appropriate messages.
         * @param {Event} event - The submit event
         */
        document.getElementById('lagerhalterAnfrageDetailForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {
                // AnfrageID aus Ergebnis holen
                const form = event.target as HTMLFormElement;
                const elementWithAttribute = form.querySelector('[class="detail-result"]');
                const anfrageid = elementWithAttribute?.getAttribute('data-anfrageid');
                const anfrageInhalt = (form.querySelector('[id="anfrageAntwortText"]') as HTMLInputElement).value;

                const requestBody = {
                    anfrageid: anfrageid,
                    anfrageInhalt: anfrageInhalt,
                    loggedInUser: loggedInUser
                }

                try {
                    let response = await fetch('http://localhost:3000/sendAngebot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (response.ok) {
                        alert("Angebot wurde abgesendet");
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('stellplaetzeVerwaltenButton').style.display = 'block';
                        document.getElementById('zusatzservicesVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerVerwaltenButton').style.display = 'block';
                        document.getElementById('lagerhalterAnfragenVerwaltenButton').style.display = 'block';

                        document.getElementById('lagerhalterAnfrageDetailForm').style.display = 'none';

                        document.getElementById('lagerhalterAnfrageDetailErgebnis').innerText = ' ';
                        document.getElementById('lagerhalterAnfrageResultForm').innerText = ' ';
                        (document.getElementById('anfrageAntwortText') as HTMLInputElement).value = '';

                        try {
                            let response = await fetch('http://localhost:3000/deleteAnfrage', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({anfrageid})
                            });

                            if (response.ok) {
                                console.log("Angebot wurde gesendet & Angebotsanfrage gelöscht")

                            } else {
                                alert('Fehler beim löschen der Anfragen');
                            }
                        } catch (err) {
                            console.error('Fehler beim löschen der Anfragen:', err);
                        }
                    } else if (response.status == 510){
                        alert("Angebot konnte nicht gesendet werden:\nKeine freien Stellplätze mehr in dieser Kategorie");
                    }
                    else {
                        alert('Fehler beim absenden der Anfrage');
                    }
                } catch (err) {
                    console.error('Fehler beim absenden der Anfrage:', err);
                }
            }
        });

        /**
         * Adds a click event listener to the "Lagerhalter Anfrage Detail" back button.
         * Displays the Lagerhalter Anfragen management form and hides the Anfrage Detail form.
         */
        document.getElementById('lagerhalterAnfrageDetailBackButton')?.addEventListener('click', function () {
            document.getElementById('lagerhalterAnfragenVerwaltenForm').style.display = 'block';
            document.getElementById('lagerhalterAnfrageDetailForm').style.display = 'none';
            document.getElementById('lagerhalterAnfrageDetailErgebnis').innerText = ' ';
        });
    }

    /**
     * Handles the actions and displays for the Werkstatt page.
     */
    else if (bodyElement.classList.contains("werkstatt")) {
        loggedInUser = Nutzer.fromJson(JSON.parse(sessionStorage.getItem('loggedInUser')));
        const welcomeElement = document.getElementById("welcome");
        welcomeElement.textContent = "Hallo " + loggedInUser.getNachname() + ", was möchten sie tun?";

        /**
         * Adds a click event listener to the "Werkstatt verwalten" button.
         * Displays the Werkstatt verwalten form and fetches Werkstattinfo.
         */
        document.getElementById('werkstattVerwaltenButton').addEventListener('click', async function () {
            document.getElementById('title').style.display = 'none';
            document.getElementById('welcome').style.display = 'none';
            document.getElementById('werkstattVerwaltenButton').style.display = 'none';
            document.getElementById('werkstattAnfragenVerwaltenButton').style.display = 'none';

            document.getElementById('werkstattVerwaltenForm').style.display = 'block';

            await fetchMarken();
            await fetchStaedte();

            try {
                let response = await fetch('http://localhost:3000/getWerkstattinfo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedInUser)
                });

                if(response.ok) {
                    let userData = await response.json();
                    console.log(userData);
                    let werkstatt = Werkstatt.createWerkstatt(loggedInUser);
                    werkstatt.setWorkshopInfo(userData.werkstattname, userData.spezHersteller, userData.angeboteneArbeiten, userData.plz, userData.stadt, userData.strasse, userData.hausnummer);

                    (document.getElementById('werkstattInfoName') as HTMLInputElement).value = werkstatt.getWerkstattname();
                    (document.getElementById('werkstattInfoArbeiten') as HTMLInputElement).value = werkstatt.getAngeboteneArbeiten();
                    (document.getElementById('werkstattInfoPlz') as HTMLInputElement).value = werkstatt.getPlz();
                    (document.getElementById('werkstattInfoStr') as HTMLInputElement).value = werkstatt.getStrasse();
                    (document.getElementById('werkstattInfoHnr') as HTMLInputElement).value = werkstatt.getHausnummer();
                    (document.getElementById('stadtSelect') as HTMLSelectElement).value = werkstatt.getStadt();
                    (document.getElementById('markenSelect') as HTMLSelectElement).value = werkstatt.getSpezHersteller();

                } else {
                    console.error('Fehler beim finden der Werkstattinformationen');
                }
            } catch (error) {
                console.error('Fehler beim finden der Werkstattinfo:', error);
            }
        });

        /**
         * Adds a click event listener to the "Werkstatt verwalten" back button.
         * Displays the main elements on the Werkstatt page and hides the Werkstatt verwalten form.
         */
        document.getElementById('werkstattVerwaltenBackButton').addEventListener('click', function () {
            document.getElementById('title').style.display = 'block';
            document.getElementById('welcome').style.display = 'block';
            document.getElementById('werkstattVerwaltenButton').style.display = 'block';
            document.getElementById('werkstattAnfragenVerwaltenButton').style.display = 'block';

            document.getElementById('werkstattVerwaltenForm').style.display = 'none';

        });

        /**
         * Adds a submit event listener to the "Werkstatt verwalten" form.
         * Handles the form submission by sending Werkstattinfo to the server.
         */
        document.getElementById('werkstattVerwaltenForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (event.submitter && event.submitter.classList.contains('action-button')) {

                let formData = new FormData(event.target as HTMLFormElement);
                let data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });
                const requestBody = {
                    data: data,
                    loggedInUser: loggedInUser
                };

                console.log(requestBody);

                try {
                    const response = await fetch('http://localhost:3000/setWerkstattinfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if(response.ok) {
                        alert('Werkstattinformationen gesetzt');
                        document.getElementById('werkstattVerwaltenForm').style.display = 'none';
                        document.getElementById('title').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('werkstattVerwaltenButton').style.display = 'block';
                        document.getElementById('werkstattAnfragenVerwaltenButton').style.display = 'block';
                    }
                    else {
                        console.error('Fehler beim setzen der Werkstattinformationen');
                    }
                } catch (error) {
                    console.error('Error during Werkstatt verwalten:', error);
                }
            }
        });
    }
});


// Additional Functions ----------------------------------------------------------------------------------------------

/**
 * Fetches the list of available car brands and populates the corresponding select element.
 */
async function fetchMarken() {
    try {
        const response = await fetch('http://localhost:3000/marken');
        const data = await response.json();

        const marken = data.marken;

        const markenSelect = document.getElementById('markenSelect');
        marken.forEach((marke: string) => {
            const option = document.createElement('option');
            option.value = marke;
            option.textContent = marke;
            markenSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Fehler beim Abrufen von Marken:', error);
    }
}

/**
 * Fetches the list of available cities and populates the corresponding select element.
 */
async function fetchStaedte() {
    try {
        const response = await fetch('http://localhost:3000/staedte');
        const data = await response.json();

        const staedte = data.staedte;

        const stadtSelect = document.getElementById('stadtSelect');
        staedte.forEach((staedt: string) => {
            const option = document.createElement('option');
            option.value = staedt;
            option.textContent = staedt;
            stadtSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Fehler beim Abrufen von Staedten:', error);
    }
}

/**
 * Displays Zusatz-Services in the specified result form.
 * @param {Array} result - An array of Zusatz-Services to be displayed.
 */
function displayZusatzServices(result) {
    const form = document.getElementById('zusatzServiceResultForm');
    if (result.length == 0) {
        const errorline = document.createElement('text');
        errorline.textContent = "Noch keine Zusatz-Services vorhanden!";
        errorline.className = 'error-line';
        form.appendChild(errorline);
    } else {
        result.forEach((entry, index) => {
            // Container for every service
            const entryContainer = document.createElement('div');
            entryContainer.className = 'result-entry';

            // Display information
            const smallServiceInfo = document.createElement('text');
            smallServiceInfo.innerHTML = `${entry.bezeichnung}<br>Kosten: ${entry.preis}€<br>Beschreibung:<br>${entry.beschreibung}`;
            entryContainer.appendChild(smallServiceInfo);

            form.appendChild(entryContainer);
        });
    }
}

/**
 * Displays the list of registered cars in the specified form.
 * @param {Array} result - An array of registered cars to be displayed.
 */
function displayRegisteredCars(result) {
    const form = document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm');
    console.log(result);
    if (result.length == 0) {
        const errorline = document.createElement('text');
        errorline.textContent = "Keine registrierten Fahrzeuge";
        errorline.className = 'error-line';
        form.appendChild(errorline);
    } else {
        result.forEach((entry, index) => {
            // Create a container for each result entry
            const entryContainer = document.createElement('div');
            entryContainer.className = 'result-entry';

            // Display Car information
            const smallFahrzeugInfo = document.createElement('text');
            let fahrbereit
            if(entry.fahrbereit == 1){
                fahrbereit = "Ja"
            }else{
                fahrbereit = "Nein"
            }
            smallFahrzeugInfo.innerHTML = `${entry.marke} ${entry.modell}<br>Wartungsstand: ${entry.wartungsstand}<br>Fahrbereit: ${fahrbereit}<br>Standort: ${entry.plz} ${entry.stadt} ${entry.strasse} ${entry.hnr}`;
            entryContainer.appendChild(smallFahrzeugInfo);


            // Attribute with FahrzeugID
            entryContainer.setAttribute('data-fahrzeugid', entry.fahrzeugid);
            entryContainer.setAttribute('data-fahrzeugmarke', entry.marke);
            entryContainer.setAttribute('data-fahrzeugmodell', entry.modell);
            // Eventlistener
            entryContainer.addEventListener('click', fahrzeugSucheErgebnisAuswahl);

            form.appendChild(entryContainer);
        });
    }
}

/**
 * Handles the selection of a car from the displayed list.
 * @param {Event} event - The click event.
 */
function fahrzeugSucheErgebnisAuswahl(event) {
    event.preventDefault();
    const auswahl = event.currentTarget;
    const fahrzeugid = auswahl.getAttribute('data-fahrzeugid');

    console.log(fahrzeugid);

    document.getElementById('fahrzeugVerwaltenForm').style.display = 'block';
    document.getElementById('fahrzeugeVerwaltenListeForm').style.display = 'none';
    document.getElementById('fahrzeugeVerwaltenFahrzeugListeForm').style.display = 'none';

    const marke = auswahl.getAttribute('data-fahrzeugmarke');
    const modell = auswahl.getAttribute('data-fahrzeugmodell');

    (document.getElementById('fahrzeugMarke') as HTMLInputElement).value = marke;
    (document.getElementById('fahrzeugModell') as HTMLInputElement).value = modell;
    document.getElementById('fahrzeugVerwaltenFahrzeugInfoForm').setAttribute('data-fahrzeugid', fahrzeugid);
}


/**
 * Displays the information of available parking spaces based on the search results.
 * @param {Array} result - An array of parking spaces to be displayed.
 */
function displayStellplatzInfo(result) {
    const form = document.getElementById('stellplatzSucheErgebnis');
    if (result.length == 0) {
        const errorline = document.createElement('text');
        errorline.textContent = "Mit diesen Suchparametern wurden keine Stellplätze gefunden";
        errorline.className = 'error-line';
        form.appendChild(errorline);
    }
    else {
        result.forEach((entry, index) => {
            // Create Container
            const entryContainer = document.createElement('div');
            entryContainer.className = 'result-entry';

            // Address
            const addressHeader = document.createElement('h4');
            addressHeader.textContent = `Adresse: ${entry.adresse.stadt}, ${entry.adresse.plz}, ${entry.adresse.strasse} ${entry.adresse.hnr}`;
            entryContainer.appendChild(addressHeader);

            // Specialized Manufacturer
            const marke = document.createElement('ul');
            marke.innerHTML = '<strong>Spezialisierte Marke:</strong>';
            const listItem = document.createElement('li');
            if (entry.lagerspezialisierung == "%") {
                listItem.textContent = "Alle Marken";
            } else {
                listItem.textContent = entry.lagerspezialisierung;
            }
            marke.appendChild(listItem);

            entryContainer.appendChild(marke);

            // Storage Conditions
            const bedingungenList = document.createElement('ul');
            bedingungenList.innerHTML = '<strong>Lagerbedingungen:</strong>';
            entry.bedingungen.forEach((bedingung) => {
                const listItem = document.createElement('li');
                listItem.textContent = bedingung;
                bedingungenList.appendChild(listItem);
            });
            entryContainer.appendChild(bedingungenList);

            // Attribute with KategorieID
            entryContainer.setAttribute('data-kategorieid', entry.kategorieid);
            // Eventlistener
            entryContainer.addEventListener('click', stellplatzSucheErgebnisAuswahl);

            // Append Container
            form.appendChild(entryContainer);
        });
    }
}

/**
 * Handles the selection of a storage space from the displayed list and fetches detailed information.
 * @param {Event} event - The click event.
 */
async function stellplatzSucheErgebnisAuswahl(event) {
    event.preventDefault();
    const auswahl = event.currentTarget;
    const kategorieid = auswahl.getAttribute('data-kategorieid');

    try {
        const response = await fetch('http://localhost:3000/getCategoryDetailinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kategorieid })
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data);
            document.getElementById('stellplatzSucheErgebnisForm').style.display = 'none';
            document.getElementById('stellplatzSucheDetailForm').style.display = 'block';

            const form = document.getElementById('stellplatzSucheDetailErgebnis');

            // Create Container
            const entryContainer = document.createElement('div');
            entryContainer.className = 'detail-result';

            // Address
            const addressLine = document.createElement('h4');
            addressLine.textContent = `Adresse: ${data.lagerInfo[0].stadt}, ${data.lagerInfo[0].plz}, ${data.lagerInfo[0].strasse} ${data.lagerInfo[0].hnr}`;
            entryContainer.appendChild(addressLine);

            // Service Hours
            const ServicezeitenLine = document.createElement('h4');
            ServicezeitenLine.textContent = `Servicezeiten: ${data.lagerInfo[0].servicezeiten}`;
            entryContainer.appendChild(ServicezeitenLine);

            // Storage Conditions
            const bedingungenList = document.createElement('ul');
            bedingungenList.innerHTML = '<strong>Lagerbedingungen:</strong>';
            data.bedingungen.forEach((bedingung) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${bedingung.bezeichnung}`;
                bedingungenList.appendChild(listItem);
            });
            entryContainer.appendChild(bedingungenList);

            // Specialized Manufacturer
            const marke = document.createElement('ul');
            marke.innerHTML = '<strong>Spezialisierte Marke:</strong>';
            const listItem = document.createElement('li');
            if (data.lagerInfo[0].lagerspezialisierung == "%") {
                listItem.textContent = "Alle Marken";
            } else {
                listItem.textContent = data.lagerInfo[0].lagerspezialisierung;
            }
            marke.appendChild(listItem);
            entryContainer.appendChild(marke);

            // Offered Services
            const addServicesList = document.createElement('ul');
            addServicesList.innerHTML = '<strong>Angebotene Zusatzservices:</strong>';
            data.services.forEach((service) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${service.bezeichnung}  ${service.preis}€`;
                addServicesList.appendChild(listItem);
            });
            entryContainer.appendChild(addServicesList);

            // Attribute with KategorieID
            entryContainer.setAttribute('data-kategorieid', data.kategorieid);
            // Append Container
            form.appendChild(entryContainer);

        } else {
            alert('Fehler beim finden der Detailinformationen');
        }
    } catch (error) {
        console.error('Fehler bei: ', error);
    }

}

/**
 * Groups and organizes the results based on category ID, city, postal code, street, house number, specialization, and condition.
 * @param {Array} input - An array of storage space information.
 * @returns {Object} - An object containing organized results.
 */
function stellplatzkatgorieGetLagerbedingungen(input: any[]): Object {
    console.log(input);
    const groupedResults = input.reduce((acc, row) => {
        const { kategorieid, stadt, plz, strasse, hnr, lagerspezialisierung, bezeichnung } = row;

        if (!acc[kategorieid]) {
            acc[kategorieid] = {
                kategorieid,
                adresse: { stadt, plz, strasse, hnr },
                lagerspezialisierung,
                bedingungen: [],
            };
        }

        // Add storage condition if available
        if (bezeichnung) {
            acc[kategorieid].bedingungen.push(bezeichnung);
        }

        return acc;
    }, {});

    const finalResult = Object.values(groupedResults);
    return finalResult;
}

/**
 * Displays the list of received offers in the specified form.
 * @param {Array} result - An array of received offers to be displayed.
 */
function displayAngebotsAnfragen(result) {
    const form = document.getElementById('lagerhalterAnfrageResultForm');
    //console.log(result);
    if (result.length == 0) {
        const errorline = document.createElement('text');
        errorline.textContent = "Keine erhaltenen Anfragen";
        errorline.className = 'error-line';
        form.appendChild(errorline);
    } else {
        result.forEach((entry, index) => {
            // Create a container for each result entry
            const entryContainer = document.createElement('div');
            entryContainer.className = 'result-entry';

            // Display request information
            const smallAnfrageInfo = document.createElement('text');
            smallAnfrageInfo.innerHTML = `Von: ${entry.vorname} ${entry.nachname} (${entry.email}) <br>Zu Lagerplatzkategorie: ${entry.bezeichnung} `;
            entryContainer.appendChild(smallAnfrageInfo);
            //console.log(smallAnfrageInfo);

            // Attribute with anfrageid
            entryContainer.setAttribute('data-anfrageid', entry.anfrageid);

            // Eventlistener
            entryContainer.addEventListener('click', angebotsAnfragenAuswahl);

            form.appendChild(entryContainer);
        });
    }
}

/**
 * Handles the selection of a storage space request from the displayed list and fetches detailed information.
 * @param {Event} event - The click event.
 */
async function angebotsAnfragenAuswahl(event) {
    event.preventDefault();
    const auswahl = event.currentTarget;
    const anfrageid = auswahl.getAttribute('data-anfrageid');
    //console.log(anfrageid);
    try {
        const response = await fetch('http://localhost:3000/getAnfrageDetailinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ anfrageid })
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data);
            document.getElementById('lagerhalterAnfragenVerwaltenForm').style.display = 'none';
            document.getElementById('lagerhalterAnfrageDetailForm').style.display = 'block';

            const form = document.getElementById('lagerhalterAnfrageDetailErgebnis');

            // Create Container
            const entryContainer = document.createElement('div');
            entryContainer.className = 'detail-result';

            // Requested by
            const anfrageVonLine = document.createElement('h4');
            anfrageVonLine.textContent = `Anfrage von: ${data[0].vorname} ${data[0].nachname} (${data[0].email})`;
            entryContainer.appendChild(anfrageVonLine);

            // Requested for category
            const anfrageWegenKategorie = document.createElement('h4');
            anfrageWegenKategorie.textContent = `Zu Lagerplatzkategorie: ${data[0].bezeichnung}`;
            entryContainer.appendChild(anfrageWegenKategorie);

            // Attribute with KategorieID
            entryContainer.setAttribute('data-anfrageid', data[0].anfrageid);
            // Append Container
            form.appendChild(entryContainer);

        } else {
            alert('Fehler beim finden der Detailinformationen');
        }
    } catch (error) {
        console.error('Fehler bei: ', error);
    }
}

/**
 * Displays the list of received offers in the specified form.
 * @param {Array} result - An array of received offers to be displayed.
 */
function displayAngebote(result) {
    const form = document.getElementById('angeboteVerwaltenResultForm');
    //console.log(result);
    if (result.length == 0) {
        const errorline = document.createElement('text');
        errorline.textContent = "Keine erhaltenen Angebote";
        errorline.className = 'error-line';
        form.appendChild(errorline);
    } else {
        result.forEach((entry, index) => {
            // Create a container for each result entry
            const entryContainer = document.createElement('div');
            entryContainer.className = 'result-entry';

            // Display offer information
            const smallAngebotInfo = document.createElement('text');
            smallAngebotInfo.innerHTML = `Lagerhalter: ${entry.email} <br>Standort: ${entry.plz} ${entry.stadt} ${entry.strasse} ${entry.hnr} `;
            entryContainer.appendChild(smallAngebotInfo);
            //console.log(smallAnfrageInfo);

            // Attribute with angebotID
            entryContainer.setAttribute('data-angebotid', entry.angebotid);

            // Eventlistener
            entryContainer.addEventListener('click', angebotAuswahl);

            form.appendChild(entryContainer);
        });
    }
}

/**
 * Handles the selection of an offer from the displayed list and fetches detailed information.
 * @param {Event} event - The click event.
 */
async function angebotAuswahl(event) {
    event.preventDefault();
    const auswahl = event.currentTarget;
    const angebotid = auswahl.getAttribute('data-angebotid');
    //console.log(angebotid);
    try {
        const response = await fetch('http://localhost:3000/getAngebotDetailinfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ angebotid })
        });

        if (response.ok) {
            let data = await response.json();
            console.log(data);
            document.getElementById('angeboteVerwaltenForm').style.display = 'none';
            document.getElementById('angebotAnnehmenAblehnenForm').style.display = 'block';

            const form = document.getElementById('angebotAnnehmenAblehnenErgebnis');

            // Create Container
            const entryContainer = document.createElement('div');
            entryContainer.className = 'detail-result';

            // Lagerhalter Info
            const lagerhalterLine = document.createElement('h4');
            lagerhalterLine.textContent = `Lagerhalter: ${data.detailInfo[0].email}`;
            entryContainer.appendChild(lagerhalterLine);

            // Address
            const addressLine = document.createElement('h4');
            addressLine.textContent = `Standort: ${data.detailInfo[0].stadt}, ${data.detailInfo[0].plz}, ${data.detailInfo[0].strasse} ${data.detailInfo[0].hnr}`;
            entryContainer.appendChild(addressLine);

            // Service Hours
            const servicezeitenLine = document.createElement('h4');
            servicezeitenLine.innerHTML = `Servicezeiten: <br> ${data.detailInfo[0].servicezeiten}`;
            entryContainer.appendChild(servicezeitenLine);

            // Storage Conditions
            const bedingungenList = document.createElement('ul');
            bedingungenList.innerHTML = '<strong>Lagerbedingungen:</strong>';
            data.lagerbedingungInfo.forEach((bedingung) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${bedingung.bezeichnung}`;
                bedingungenList.appendChild(listItem);
            });
            entryContainer.appendChild(bedingungenList);

            // Specialized Manufacturer
            const marke = document.createElement('ul');
            marke.innerHTML = '<strong>Spezialisierte Marke:</strong>';
            const listItem = document.createElement('li');
            if (data.detailInfo[0].lagerspezialisierung == "%") {
                listItem.textContent = "Alle Marken";
            } else {
                listItem.textContent = data.detailInfo[0].lagerspezialisierung;
            }
            marke.appendChild(listItem);
            entryContainer.appendChild(marke);

            // Offered Services
            const addServicesList = document.createElement('ul');
            addServicesList.innerHTML = '<strong>Angebotene Zusatzservices:</strong>';
            data.zusatzserviceInfo.forEach((service) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${service.bezeichnung}  ${service.preis}€`;
                addServicesList.appendChild(listItem);
            });
            entryContainer.appendChild(addServicesList);

            // Price
            const preisLine = document.createElement('h4');
            preisLine.textContent = `Kosten: ${data.detailInfo[0].kosten}€/Monat`;
            entryContainer.appendChild(preisLine);

            // Other Information
            const sonstigesLine = document.createElement('h4');
            sonstigesLine.innerHTML = `Sonstige Informationen von Lagerhalter:<br> ${data.detailInfo[0].inhalt}`;
            entryContainer.appendChild(sonstigesLine);

            // Attribute with AngebotID
            entryContainer.setAttribute('data-angebotid', data.detailInfo[0].angebotid);
            // Append Container
            form.appendChild(entryContainer);
        } else {
            alert('Fehler beim finden der Detailinformationen zum Angebot');
        }
    } catch (error) {
        console.error('Fehler bei: ', error);
    }
}
