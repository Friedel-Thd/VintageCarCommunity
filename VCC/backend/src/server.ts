import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import {createDatabase, fillDatabase} from "./createDatabase.js";
import {
    changeVerfuegbarkeit,
    createAngebot,
    createAngebotsanfrage, createFahrzeug,
    createService,
    createUser,
    setFahrzeugDaten,
    setLagerDaten,
    setWerkstattinfo
} from "./sqlInserts.js";
import Nutzer from '../../model/Nutzer.mjs';
import Einlagerer from "../../model/Einlagerer.mjs";
import Lagerhalter from "../../model/Lagerhalter.mjs";
import Werkstatt from "../../model/Werkstatt.mjs";
import Fahrzeug from "../../model/Fahrzeug.mjs";
import Stellplatz from "../../model/Stellplatz.mjs";
import Lagerplatzkategorie from "../../model/Lagerplatzkategorie.mjs";


// Express application instance
const app: express.Application = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON requests
app.use(bodyParser.json());

// DATABASE SECTION ---------------------------------------------------------------------
// Establish connection to the SQLite database
const db = new sqlite3.Database('vintage_car_community.db');

// Create tables if they do not exist
createDatabase(db);

// Populate tables with data
// Note: Only use when setting up new Database
// fillDatabase(db);
// --------------------------------------------------------------------------------------

// GET REQUESTS ------------------------------------------------------------------------
// Endpoint to retrieve the next available ID
app.get('/nextID', async (req: Request, res: Response) => {
    // Fetch the next available user ID from the database
    const nextFreeID = await getNextUserID(db);

    // Respond with the next available ID in JSON format
    res.json({ nextFreeID });
});

// Endpoint to retrieve a list of cities
app.get('/staedte', async (req: Request, res: Response) => {
    // Fetch the list of cities from the database
    const staedte = await getStaedte(db);

    // Respond with the list of cities in JSON format
    res.json({ staedte });
});

// Endpoint to retrieve a list of car brands
app.get('/marken', async (req: Request, res: Response) => {
    // Fetch the list of car brands from the database
    const marken = await getMarken(db);

    // Respond with the list of car brands in JSON format
    res.json({ marken });
});

// POST REQUESTS ----------------------------------------------------------------------

// Registration
app.post('/register', (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Create user object from JSON data
    let user = Nutzer.fromJson(userData);

    // Determine and set the account type based on 'kontotypType'
    if (userData.kontotypType == "Einlagerer") {
        user.setKontotyp(Einlagerer.createEinlagerer(user));
    } else if (userData.kontotypType == "Lagerhalter") {
        user.setKontotyp(Lagerhalter.createLagerhalter(user));
    } else if (userData.kontotypType == "Werkstatt") {
        user.setKontotyp(Werkstatt.createWerkstatt(user));
    }

    // Check if user already exists
    console.log('Email of the user to be checked:', user.getEmail());

    // Prepare and execute database query to check for existing user
    let existingUserStmt = db.prepare('SELECT userid FROM nutzer WHERE email = ?');
    existingUserStmt.get(user.getEmail(), (err: any, row: any) => {
        if (err) {
            console.error('Error userExists:', err);
            res.sendStatus(500); // Internal Server Error
        } else {
            console.log(row);
            if (row) {
                console.log('User with this email already exists');
                res.sendStatus(400); // Bad Request
            } else {
                console.log('User does not exist. Proceeding with createUser.');
                createUser(db, user, res);
            }
        }
    });
    existingUserStmt.finalize();
});

// Login
app.post('/login', (req: Request, res: Response) => {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    // Prepare and execute database query for user login
    const stmt = db.prepare(`
        SELECT nutzer.*, 
           Einlagerer.userid AS einlagererUserID, 
           Lagerhalter.userid AS lagerhalterUserID, 
           Werkstatt.userid AS werkstattUserID 
    FROM nutzer 
    LEFT JOIN Einlagerer ON nutzer.userid = Einlagerer.userid 
    LEFT JOIN Lagerhalter ON nutzer.userid = Lagerhalter.userid 
    LEFT JOIN Werkstatt ON nutzer.userid = Werkstatt.userid 
    WHERE nutzer.email = ? AND nutzer.passwort = ?
    `);

    stmt.get(email, password, (err: any, row: any) => {
        console.log('Database response:', err, row);
        if (err) {
            console.error('Error during login:', err);
            res.sendStatus(500); // Internal Server Error
        } else if (row) {
            res.json(row);
        } else {
            res.sendStatus(401); // Unauthorized
        }
    });

    stmt.finalize();
});

// Stellplatzsuche
app.post('/stellplatzsuche', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch available parking spaces based on city and car brand
    const stellplaetze = await getStellplaetze(db, userData.stadt, userData.marke);

    // Respond with the list of parking spaces in JSON format
    res.json({ stellplaetze });
});

// Stellplatz Detailinformationen
app.post('/getCategoryDetailinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch category details, storage info, and services based on category ID
    const bedingungen = await getBedingungen(db, userData.kategorieid);
    const lagerInfo = await getLagerInfoFromCategory(db, userData.kategorieid);
    const services = await getServiceInfoFromCategory(db, userData.kategorieid);

    // Construct and respond with detailed information in JSON format
    const detailInfo = {
        kategorieid: userData.kategorieid,
        bedingungen: bedingungen,
        services: services,
        lagerInfo: lagerInfo
    };
    res.status(200).json(detailInfo);
});

// Angebote verwalten (Einlagerer)
app.post('/getAngebote', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Create Nutzer object from JSON data and fetch Angebote list
    const user = Nutzer.fromJson(userData);
    let angebotsListe = await getAngebote(db, user);

    // Respond with the fetched Angebote list
    res.status(200).json(angebotsListe);
});

// Angebotsanfrage Detailinformationen
app.post('/getAnfrageDetailinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch and respond with detailed information about the Angebotsanfrage
    const detailInfo = await getAngebotsAnfrage(db, userData.anfrageid);
    res.status(200).json(detailInfo);
});

// Angebotsanfrage senden
app.post('/sendAngebotsanfrage', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const user = Nutzer.fromJson(userData.loggedInUser);
    const kategorieID = userData.kategorieid;

    // Fetch Lagerhalter ID and Einlagerer ID and create Angebotsanfrage
    const lagerhalterID = await getLagerhalterIDFromCategoryID(db, kategorieID);
    const einlagererID = await getEinlagererID(db, user);
    createAngebotsanfrage(db, einlagererID[0].einlagererid, kategorieID, lagerhalterID[0].lagerhalterid, res);
});


// Angebot ablehnen/entfernen
app.post('/deleteAngebot', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const angebotID = userData.angebotid;

    // Fetch Stellplatz ID, change availability, and delete the Angebot
    const stellplatzID = await getStellplatzIDFromAngebotID(db, angebotID);
    changeVerfuegbarkeit(db, stellplatzID[0].stellplatzid);
    deleteAngebot(db, angebotID, res);
});

// Angebot nach Annahme entfernen
app.post('/deleteAcceptedAngebot', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const angebotID = userData.angebotid;

    // Delete the Angebot after acceptance
    deleteAngebot(db, angebotID, res);
});

// Angebot annehmen
app.post('/acceptAngebot', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const angebotID = userData.angebotid;

    // Fetch Stellplatz ID, Einlagerer ID, and create Fahrzeug entry
    const stellplatzID = await getStellplatzIDFromAngebotID(db, angebotID);
    const user = Nutzer.fromJson(userData.loggedInUser);
    const einlagererID = await getEinlagererID(db, user);
    createFahrzeug(db, stellplatzID[0].stellplatzid, einlagererID[0].einlagererid, userData.fahrzeugMarke, userData.fahrzeugModell, res);
});

// Angebot Detailinformation
app.post('/getAngebotDetailinfo', async (req: Request, res: Response)=> {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch detailed information about the Angebot
    const detailInfo = await getAngebotDetailInfo(db, userData.angebotid);
    const zusatzserviceInfo = await getZusatzservicesFromAngebotID(db, userData.angebotid);
    const lagerbedingungInfo = await getLagerbedingungenFromAngebotID(db, userData.angebotid);
    const angebotInfo = {
        zusatzserviceInfo: zusatzserviceInfo,
        lagerbedingungInfo: lagerbedingungInfo,
        detailInfo: detailInfo
    };

    // Respond with the fetched Angebot information
    res.status(200).json(angebotInfo);
});

// Angebot senden
app.post('/sendAngebot', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch Lagerhalter, Einlagerer, Kategorie, and Stellplatz IDs, then create Angebot
    const user = Nutzer.fromJson(userData.loggedInUser);
    const anfrageID = userData.anfrageid;
    const anfrageInhalt = userData.anfrageInhalt;
    const lagerhalterID = await getLagerhalter(db, user);
    const einlagererID = await getEinlagererIDFromAnfrageID(db, anfrageID);
    const kategorieID = await getKategorieIDFromAnfrageID(db, anfrageID);
    const stellplatzID = await getOpenStellplatzIDFromCategorieID(db, kategorieID[0].kategorieid);

    // Check for available Stellplatz and create Angebot
    if(stellplatzID[0].stellplatzid == null) {
        res.sendStatus(510);
    } else {
        changeVerfuegbarkeit(db, stellplatzID[0].stellplatzid);
        createAngebot(db, lagerhalterID[0].lagerhalterid, einlagererID[0].einlagererid, stellplatzID[0].stellplatzid, anfrageInhalt, res);
    }
});

// Fahrzeuge verwalten (Einlagerer)
app.post('/setFahrzeugInfo', async (req: Request, res: Response) => {
    // Extract user data from request body and set Fahrzeug information
    const userData = req.body;
    setFahrzeugDaten(db, userData, res);
});

app.post('/getFahrzeugInfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const user = Nutzer.fromJson(userData);

    // Fetch Fahrzeug list and create Einlagerer with detailed Fahrzeug information
    let fahrzeugListe = await getFahrzeuge(db, user);
    let einlagerer = Einlagerer.createEinlagerer(user);
    for (const fahrzeug of fahrzeugListe) {
        await getCarObject(fahrzeug, einlagerer);
    }

    // Respond with the detailed Fahrzeug information
    console.log(einlagerer);
    res.status(200).json(fahrzeugListe);
});


// Lager verwalten
app.post('/getLagerinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);
    const user = Nutzer.fromJson(userData);

    // Fetch Lager information and create Lagerhalter with the data
    let lagerDaten = await getLagerDaten(db, user);
    let lagerhalter = Lagerhalter.createLagerhalter(user);
    lagerhalter.getStorage().setLagerDaten(lagerDaten[0].lagerspezialisierung, lagerDaten[0].servicezeiten, lagerDaten[0].plz, lagerDaten[0].stadt, lagerDaten[0].hnr, lagerDaten[0].strasse);

    // Respond with the Lagerhalter information
    res.status(200).json(lagerhalter);
});

app.post('/setLagerinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Update Lager information for the user and respond accordingly
    const user = Nutzer.fromJson(userData.loggedInUser);
    setLagerDaten(db, user.getuserid(), userData, res);
});

// Zusatz-Services verwalten
app.post('/getServices', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);
    const user = Nutzer.fromJson(userData);

    // Fetch Zusatz-Services for the user and respond with the data
    let zusatzServices = await getServices(db, user);
    res.status(200).json(zusatzServices);
});

// Zusatz-Service anbieten
app.post('/newService', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch Lagerhalter and create a new Zusatz-Service
    let lagerhalter = await getLagerhalter(db, Nutzer.fromJson(userData.loggedInUser));
    console.log(lagerhalter);
    createService(db, lagerhalter[0].lagerhalterid, userData.data, res);
});

// Anfragen erhalten
app.post('/getUniqueAnfragen', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Fetch and respond with unique Anfragen for the user
    let anfragenListe = await getAngebotsAnfragen(db, Nutzer.fromJson(userData));
    res.status(200).json(anfragenListe);
});

// Anfrage löschen
app.post('/deleteAnfrage', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    const anfrageID = userData.anfrageid;
    console.log(anfrageID);

    // Delete the specified Anfrage and respond accordingly
    deleteAngebotsanfrage(db, anfrageID, res);
});

// Werkstatt verwalten
app.post('/getWerkstattinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    //console.log(userData);
    const user = Nutzer.fromJson(userData);

    // Fetch Werkstatt information and create Werkstatt object
    let werkstattinfo = await getWerkstattInfo(db, user);
    let werkstatt = Werkstatt.createWerkstatt(user);
    werkstatt.setWorkshopInfo(werkstattinfo[0].werkstattname, werkstattinfo[0].herstellerspezialisierung, werkstattinfo[0].angebotenearbeiten, werkstattinfo[0].postleitzahl, werkstattinfo[0].stadt, werkstattinfo[0].strasse, werkstattinfo[0].hnr);
    //console.log("werkstatt: ", werkstatt);

    // Respond with the Werkstatt information
    res.status(200).json(werkstatt);
});

app.post('/setWerkstattinfo', async (req: Request, res: Response) => {
    // Extract user data from request body
    const userData = req.body;
    console.log(userData);

    // Update Werkstatt information for the user and respond accordingly
    const user = Nutzer.fromJson(userData.loggedInUser);
    setWerkstattinfo(db, user.getuserid(), userData, res);
});

// Additional Functions ----------------------------------------------------

/**
 * Creates a new car object and adds it to the specified 'Einlagerer'.
 * @param {any} fahrzeug - Data containing information about the car
 * @param {Einlagerer} einlagerer - The storage facility owner to whom the car is added
 */
async function getCarObject(fahrzeug: any,einlagerer: Einlagerer) {
    let stellplatz = await getStellplatz(db, fahrzeug.stellplatzid);
    let lagerkategorie = await getLagerKategorie(db, stellplatz[0].kategorieid);
    let lagerbedingungen = await getBedingungen(db, stellplatz[0].kategorieid);
    let newCategory = Lagerplatzkategorie.createCategory(lagerkategorie[0].bezeichnung, lagerbedingungen, lagerkategorie[0].platzzahl, lagerkategorie[0].kategorieid);
    let newSpace = Stellplatz.createParkingSpace(newCategory, fahrzeug.stellplatzid);
    let newCar = Fahrzeug.createCar(fahrzeug.marke, fahrzeug.modell, newSpace);
    einlagerer.addCar(newCar);
}

/**
 * Retrieves the next available user ID from the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @returns {Promise<number>} - A promise that resolves with the next available user ID
 */
function getNextUserID(db: sqlite3.Database): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        db.get('SELECT MAX(userid) as maxUserID FROM nutzer', (err, row: { maxUserID: number }) => {
            if (err) {
                reject(err);
            } else {
                // If there are no rows yet, start from 1, otherwise increment the maximum ID
                const nextUserID = row && row.maxUserID !== null ? row.maxUserID + 1 : 1;
                resolve(nextUserID);
            }
        });
    });
}

/**
 * Retrieves the names of cities from the 'stadt' table in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @returns {Promise<string[]>} - A promise that resolves with an array containing city names
 */
function getStaedte(db: sqlite3.Database): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        db.all("SELECT stadtname FROM stadt", (error, rows) => {
            if (error) {
                reject(error);
            } else {
                const staedteArray = rows.map((row: { stadtname: string }) => row.stadtname);
                resolve(staedteArray);
            }
        });
    });
}

/**
 * Retrieves the names of car brands from the 'marke' table in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @returns {Promise<string[]>} - A promise that resolves with an array containing car brand names
 */
function getMarken(db: sqlite3.Database): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        db.all("SELECT markenname FROM marke", (error, rows) => {
            if (error) {
                reject(error);
            } else {
                const markenArray = rows.map((row: { markenname: string }) => row.markenname);
                resolve(markenArray);
            }
        });
    });
}

/**
 * Retrieves information about available parking spaces based on city and car brand.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {string} stadt - The city name to filter parking spaces
 * @param {string} marke - The car brand name to filter parking spaces
 * @returns {Promise<any[]>} - A promise that resolves with an array containing parking space information
 */
function getStellplaetze(db: sqlite3.Database, stadt: string, marke: string): Promise<string[]> {

    const query = `
        SELECT lpk.kategorieid, l.stadt, l.plz, l.strasse, l.hnr, lb.bezeichnung, l.lagerspezialisierung
        FROM lagerplatzkategorie lpk
        LEFT JOIN kategoriebedingungen kb ON lpk.kategorieid = kb.kategorieid
        LEFT JOIN lagerbedingung lb ON kb.bedingungid = lb.bedingungid
        JOIN lager l ON lpk.lagerid = l.lagerid
        WHERE l.stadt LIKE ? AND (l.lagerspezialisierung LIKE ?);
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, [stadt, marke], (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about a storage category based on the category ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} lagerKategorieID - The ID of the storage category to retrieve information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing storage category information
 */
function getLagerKategorie(db: sqlite3.Database, lagerKategorieID: number): Promise<any[]> {
    const query = `
        SELECT *
        FROM lagerplatzkategorie
        WHERE kategorieid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, lagerKategorieID, (err, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the storage conditions (bedingungen) for a given storage category.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} lagerKategorieID - The ID of the storage category to retrieve conditions
 * @returns {Promise<any[]>} - A promise that resolves with an array containing storage conditions
 */
function getBedingungen(db:sqlite3.Database, lagerKategorieID: number): Promise<any[]> {
    const query = `
        SELECT lb.bezeichnung
        FROM lagerplatzkategorie lpk
        JOIN kategoriebedingungen kb ON lpk.kategorieid = kb.kategorieid
        JOIN lagerbedingung lb ON kb.bedingungid = lb.bedingungid
        WHERE lpk.kategorieid = ?;
    `;
    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, lagerKategorieID, (err, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about a parking space based on its ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} stellplatzID - The ID of the parking space to retrieve information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing parking space information
 */
function getStellplatz(db: sqlite3.Database, stellplatzID: number): Promise<any[]> {
    const query = `
        SELECT *
        FROM stellplatz s 
        WHERE stellplatzid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, stellplatzID, (err, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about vehicles stored by a user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for whom to retrieve vehicle information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing vehicle information
 */
function getFahrzeuge(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT 
            f.fahrzeugid,
            f.stellplatzid,
            f.einlagererid,
            f.marke,
            f.modell,
            f.fahrbereit,
            f.wartungsstand,
            l.plz,
            l.stadt,
            l.strasse,
            l.hnr
        FROM fahrzeug f 
        JOIN einlagerer e ON f.einlagererid = e.einlagererid
        JOIN stellplatz s ON f.stellplatzid = s.stellplatzid
        JOIN lagerplatzkategorie lpk ON s.kategorieid = lpk.kategorieid
        JOIN lager l ON lpk.lagerid = l.lagerid
        WHERE userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
       db.all(query, user.getuserid(), (err, rows: any[]) => {
           if (err) {
               reject(err);
           } else {
               console.log(rows);
               resolve(rows);
           }
       });
    });
}

/**
 * Retrieves information about the storage facilities (lager) owned by a user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for whom to retrieve storage facility information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing storage facility information
 */
function getLagerDaten(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT l.*
        FROM lagerhalter lh
        LEFT JOIN lager l ON lh.lagerhalterid = l.besitzer
        WHERE lh.userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
       db.all(query, user.getuserid(), (err, rows: any[]) => {
           if (err) {
               reject(err);
           } else {
               console.log(rows);
               resolve(rows);
           }
       });
    });
}

/**
 * Retrieves additional services (zusatzservice) offered by a user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for whom to retrieve additional services
 * @returns {Promise<any[]>} - A promise that resolves with an array containing additional service information
 */
function getServices(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT zs.*
        FROM zusatzservice zs 
        JOIN lagerhalter l ON l.lagerhalterid = zs.anbieter
        WHERE l.userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (err, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about a workshop (werkstatt) owned by a user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for whom to retrieve workshop information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing workshop information
 */
function getWerkstattInfo(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT *
        FROM werkstatt 
        WHERE userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about a storage facility owner (lagerhalter) based on the user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for whom to retrieve storage facility owner information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing storage facility owner information
 */
function getLagerhalter(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT *
        FROM lagerhalter
        WHERE userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about storage facilities (lager) based on the category ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} kategorieid - The category ID for which to retrieve storage facility information
 * @returns {Promise<String[]>} - A promise that resolves with an array containing storage facility information
 */
function getLagerInfoFromCategory(db: sqlite3.Database, kategorieid: number): Promise<String[]> {
    const query = `
        SELECT l.servicezeiten, l.plz, l.stadt, l.strasse, l.hnr, l.lagerspezialisierung
        FROM lagerplatzkategorie lk 
        JOIN lager l ON lk.lagerid = l.lagerid
        JOIN lagerhalter lh ON l.besitzer = lh.lagerhalterid
        WHERE lk.kategorieid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, kategorieid, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves information about additional services (zusatzservice) based on the category ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} kategorieid - The category ID for which to retrieve additional service information
 * @returns {Promise<String[]>} - A promise that resolves with an array containing additional service information
 */
function getServiceInfoFromCategory(db: sqlite3.Database, kategorieid: number): Promise<String[]> {
    const query = `
        SELECT zs.bezeichnung, zs.preis
        FROM zusatzservice zs 
        JOIN lagerhalter lh ON lh.lagerhalterid = zs.anbieter
        JOIN lager l ON l.besitzer = lh.lagerhalterid
        JOIN lagerplatzkategorie lk ON l.lagerid = lk.lagerid 
        WHERE lk.kategorieid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, kategorieid, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}


/**
 * Retrieves the storage facility owner ID (lagerhalterid) based on the category ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} kategorieid - The category ID for which to retrieve the storage facility owner ID
 * @returns {Promise<any[]>} - A promise that resolves with an array containing the storage facility owner ID
 */
function getLagerhalterIDFromCategoryID(db: sqlite3.Database, kategorieid: number): Promise<any[]> {
    const query = `
        SELECT lh.lagerhalterid
        FROM lagerhalter lh
        JOIN lager l ON l.besitzer = lh.lagerhalterid
        JOIN lagerplatzkategorie lk ON l.lagerid = lk.lagerid 
        WHERE lk.kategorieid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, kategorieid, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the ID of the first available parking space (stellplatzid) based on the category ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} kategorieid - The category ID for which to retrieve the first available parking space ID
 * @returns {Promise<any[]>} - A promise that resolves with an array containing the first available parking space ID
 */
function getOpenStellplatzIDFromCategorieID(db: sqlite3.Database, kategorieid: number):Promise<any[]> {
    const query = `
        SELECT min(s.stellplatzid) AS stellplatzid
        FROM stellplatz s
        WHERE verfuegbarkeit = 1 AND kategorieid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, kategorieid, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the Einlagerer ID based on the offer request ID (anfrageid).
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} anfrageid - The offer request ID for which to retrieve the Einlagerer ID
 * @returns {Promise<any[]>} - A promise that resolves with an array containing the Einlagerer ID
 */
function getEinlagererIDFromAnfrageID(db:sqlite3.Database, anfrageid: number): Promise<any[]> {
    const query = `
        SELECT a.einlagererid
        FROM angebotsanfrage a
        WHERE anfrageid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, anfrageid, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the Einlagerer ID based on the user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for which to retrieve the Einlagerer ID
 * @returns {Promise<any[]>} - A promise that resolves with an array containing the Einlagerer ID
 */
function getEinlagererID(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT e.einlagererid
        FROM einlagerer e
        JOIN nutzer n ON n.userid = e.userid
        WHERE n.userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the category ID based on the offer request ID (anfrageID).
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} anfrageID - The offer request ID for which to retrieve the category ID
 * @returns {Promise<any>} - A promise that resolves with an object containing the category ID
 */
function getKategorieIDFromAnfrageID(db: sqlite3.Database, anfrageID: number): Promise<any> {
    const query = `
        SELECT a.kategorieid
        FROM angebotsanfrage a
        WHERE anfrageid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, anfrageID, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves the parking space ID (stellplatzid) based on the offer ID (angebotID).
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} angebotID - The offer ID for which to retrieve the parking space ID
 * @returns {Promise<any>} - A promise that resolves with an object containing the parking space ID
 */
function getStellplatzIDFromAngebotID(db: sqlite3.Database, angebotID: number): Promise<any> {
    const query = `
        SELECT stellplatzid
        FROM angebot
        WHERE angebotid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, angebotID, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves a list of offer requests along with user and category information for a specific user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for which to retrieve offer requests
 * @returns {Promise<any[]>} - A promise that resolves with an array containing offer request information
 */
function getAngebotsAnfragen(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT a.*, n.email, n.vorname, n.nachname, lpk.bezeichnung
        FROM angebotsanfrage a
        JOIN lagerhalter lh ON a.lagerhalterid = lh.lagerhalterid
        JOIN einlagerer e ON a.einlagererid = e.einlagererid
        JOIN nutzer n ON e.userid = n.userid
        JOIN lagerplatzkategorie lpk ON a.kategorieid = lpk.kategorieid 
        WHERE lh.userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves an offer request along with user and category information based on the offer request ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} anfrageID - The offer request ID for which to retrieve information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing offer request information
 */
function getAngebotsAnfrage(db:sqlite3.Database, anfrageID: number): Promise<any[]> {
    const query = `
        SELECT a.*, n.email, n.vorname, n.nachname, lpk.bezeichnung
        FROM angebotsanfrage a
        JOIN lagerhalter lh ON a.lagerhalterid = lh.lagerhalterid
        JOIN einlagerer e ON a.einlagererid = e.einlagererid
        JOIN nutzer n ON e.userid = n.userid
        JOIN lagerplatzkategorie lpk ON a.kategorieid = lpk.kategorieid
        WHERE a.anfrageid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, anfrageID,  (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Deletes an offer request from the database based on the offer request ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} anfrageID - The offer request ID to be deleted
 * @param {express.Response} res - The Express response object
 */
function deleteAngebotsanfrage(db:sqlite3.Database, anfrageID: number, res: express.Response): void {
    const deleteAngebotsanfrageStmt = db.prepare(`
        DELETE FROM angebotsanfrage
        WHERE anfrageid = ?;
    `);

    deleteAngebotsanfrageStmt.run(anfrageID, (err: any) => {
        if (err) {
            console.error('Error deleting Anfrage:', err);
            res.sendStatus(500); // Internal Server Error
        } else {
            res.sendStatus(200); // OK
            console.log('Anfrage erfolgreich gelöscht, anfrageid:', anfrageID);
        }
    });

    deleteAngebotsanfrageStmt.finalize();
}

/**
 * Retrieves a list of offers along with user and location information for a specific user.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user for which to retrieve offers
 * @returns {Promise<any[]>} - A promise that resolves with an array containing offer information
 */
function getAngebote(db: sqlite3.Database, user: Nutzer): Promise<any[]> {
    const query = `
        SELECT a.*, n.email, l.stadt, l.strasse, l.plz, l.hnr
        FROM angebot a
        JOIN lagerhalter lh ON a.lagerhalterid = lh.lagerhalterid
        JOIN lager l ON l.besitzer = lh.lagerhalterid
        JOIN nutzer n ON lh.userid = n.userid
        JOIN einlagerer e ON e.einlagererid = a.einlagererid
        WHERE e.userid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, user.getuserid(), (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Deletes an offer from the database based on the offer ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} angebotID - The offer ID to be deleted
 * @param {express.Response} res - The Express response object
 */
function deleteAngebot(db:sqlite3.Database, angebotID: number, res: express.Response): void {
    const deleteAngebotStmt = db.prepare(`
        DELETE FROM angebot
        WHERE angebotid = ?;
    `);

    deleteAngebotStmt.run(angebotID, (err: any) => {
        if (err) {
            console.error('Error deleting Anfrage:', err);
            res.sendStatus(500); // Internal Server Error
        } else {
            res.sendStatus(200); // OK
            console.log('Anfrage erfolgreich gelöscht, angebotid:', angebotID);
        }
    });

    deleteAngebotStmt.finalize();
}

/**
 * Retrieves detailed information about an offer based on the offer ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} angebotID - The offer ID for which to retrieve information
 * @returns {Promise<any[]>} - A promise that resolves with an array containing detailed offer information
 */
function getAngebotDetailInfo(db: sqlite3.Database, angebotID: number): Promise<any[]> {
    const query = `
        SELECT a.*, n.email, l.*, lk.kosten
        FROM angebot a
        JOIN lagerhalter lh ON a.lagerhalterid = lh.lagerhalterid
        JOIN lager l ON l.besitzer = lh.lagerhalterid
        JOIN stellplatz sp ON sp.stellplatzid = a.stellplatzid
        JOIN lagerplatzkategorie lk ON sp.kategorieid = lk.kategorieid
        JOIN nutzer n ON lh.userid = n.userid
        WHERE a.angebotid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, angebotID, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves additional services associated with a specific offer ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} angebotID - The offer ID for which to retrieve additional services
 * @returns {Promise<any[]>} - A promise that resolves with an array containing additional service information
 */
function getZusatzservicesFromAngebotID(db: sqlite3.Database, angebotID: number): Promise<any[]> {
    const query = `
        SELECT z.bezeichnung, z.preis
        FROM angebot a
        JOIN zusatzservice z ON a.lagerhalterid = z.anbieter
        WHERE angebotid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, angebotID, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

/**
 * Retrieves storage conditions associated with a specific offer ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} angebotID - The offer ID for which to retrieve storage conditions
 * @returns {Promise<any[]>} - A promise that resolves with an array containing storage condition information
 */
function getLagerbedingungenFromAngebotID(db: sqlite3.Database, angebotID: number): Promise<any[]> {
    const query = `
        SELECT lb.bezeichnung
        FROM angebot a
        JOIN stellplatz sp ON a.stellplatzid = sp.stellplatzid
        JOIN lagerplatzkategorie lk ON sp.kategorieid = lk.kategorieid
        JOIN kategoriebedingungen kb ON kb.kategorieid = lk.kategorieid
        JOIN lagerbedingung lb ON kb.bedingungid = lb.bedingungid
        WHERE a.angebotid = ?;
    `;

    return new Promise<any[]>((resolve: (value: any[]) => void, reject) => {
        db.all(query, angebotID, (error, rows: any[]) => {
            if (error) {
                reject(error);
            } else {
                console.log(rows);
                resolve(rows);
            }
        });
    });
}

// START/SHUTDOWN------------------------------------------------------------------------------------------------------

// Define the port number for the server. Use the environment variable PORT if available, otherwise default to 3000.
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle the SIGINT signal (Ctrl+C) to gracefully shut down the server and close the database connection.
process.on('SIGINT', () => {
    // Close the database connection.
    db.close(() => {
        console.log('Server shutting down. Closed database connection.');
        // Exit the process with code 0 (successful exit).
        process.exit(0);
    });
});
