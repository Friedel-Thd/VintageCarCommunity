import sqlite3 from "sqlite3";
import express from "express";
import Nutzer from "../../model/Nutzer.mjs";
import Lagerhalter from "../../model/Lagerhalter.mjs";
import Einlagerer from "../../model/Einlagerer.mjs";
import Werkstatt from "../../model/Werkstatt.mjs";

/**
 * This function creates a new user in the database and handles the creation of specific user types based on 'Kontotyp'.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {Nutzer} user - The user object to be inserted into the 'nutzer' table
 * @param {express.Response} res - The Express response object
 */
export function createUser(db: sqlite3.Database, user: Nutzer, res: express.Response) {
    db.serialize(() => {
        const insertUserStmt = db.prepare(`
            INSERT INTO nutzer (userID, email, passwort, vorname, nachname, telefonnummer, stadt, plz, strasse, hnr) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `);

        insertUserStmt.run(
            user.getuserid(), user.getEmail(), user.getPasswort(), user.getVorname(), user.getNachname(),
            user.getTelefonnummer(), user.getStadt(), user.getPlz(), user.getStrasse(), user.getHnr(),
            (err: any) => {
                if (err) {
                    console.error('Error creating user:', err);
                    res.sendStatus(500); // Internal Server Error
                } else {
                    console.log('User created successfully:', user.getEmail(), user.getVorname());

                    // Insert specific user type based on Kontotyp
                    if (user.getKontotyp() instanceof Lagerhalter) {
                        createLagerhalter(db, user.getuserid(), res);
                    } else if (user.getKontotyp() instanceof Einlagerer) {
                        createEinlagerer(db, user.getuserid(), res);
                    } else if (user.getKontotyp() instanceof Werkstatt) {
                        createWerkstatt(db, user.getuserid(), res);
                    }
                }
            }
        );

        insertUserStmt.finalize();
    });
}

/**
 * This function creates a new 'lagerhalter' entry for a given user ID and also creates a corresponding 'lager' entry.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} userId - The user ID for whom the 'lagerhalter' entry is being created
 * @param {express.Response} res - The Express response object
 */
function createLagerhalter(db: sqlite3.Database, userId: number, res: express.Response) {
    const insertLagerhalterStmt = db.prepare(`
        INSERT INTO lagerhalter (userId) VALUES (?);
    `);

    insertLagerhalterStmt.run(userId, (err: any) => {
        if (err) {
            console.error('Error creating Lagerhalter:', err);
        } else {
            console.log('Lagerhalter successfully created for user ID:', userId);
        }
    });

    insertLagerhalterStmt.finalize();

    const getLagerhalterIDStmt = db.prepare(`
        SELECT lagerhalterid
        FROM lagerhalter 
        WHERE userid = ?
    `);

    getLagerhalterIDStmt.get(userId, async (err: any, row: any) => {
        try {
            if (err) {
                res.sendStatus(500);
                console.error('Error creating Lager:', err);
            } else {
                if (row) {
                    let lagerhalterID = row.lagerhalterid;

                    const createLagerStmt = db.prepare(`
                        INSERT INTO lager (besitzer) VALUES (?);
                    `);

                    createLagerStmt.run(lagerhalterID, (err: any) => {
                        if (err) {
                            console.error('Error creating Lager:', err);
                        } else {
                            console.log('Lager successfully created for lagerhalterid: ', lagerhalterID);
                        }
                    });

                    createLagerStmt.finalize();
                    console.log('Lager successfully created for user ID: ', userId);
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                    console.error('No result found for user ID: ', userId);
                }
            }
        } catch (error) {
            console.error('Error in try-catch block:', error);
        }
    });

    getLagerhalterIDStmt.finalize();
}

/**
 * This function creates a new 'einlagerer' entry for a given user ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} userId - The user ID for whom the 'einlagerer' entry is being created
 * @param {express.Response} res - The Express response object
 */
function createEinlagerer(db: sqlite3.Database, userId: number, res: express.Response) {
    const insertEinlagererStmt = db.prepare(`
        INSERT INTO einlagerer (userId) VALUES (?);
    `);

    insertEinlagererStmt.run(userId, (err: any) => {
        if (err) {
            console.error('Error creating Einlagerer:', err);
            res.sendStatus(500); // Internal Server Error
        } else {
            res.sendStatus(200); // OK
            console.log('Einlagerer successfully created for user ID:', userId);
        }
    });

    insertEinlagererStmt.finalize();
}

/**
 * This function creates a new 'werkstatt' entry for a given user ID.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} userId - The user ID for whom the 'werkstatt' entry is being created
 * @param {express.Response} res - The Express response object
 */
function createWerkstatt(db: sqlite3.Database, userId: number, res: express.Response) {
    const insertWerkstattStmt = db.prepare(`
        INSERT INTO werkstatt (userId) VALUES (?);
    `);

    insertWerkstattStmt.run(userId, (err: any) => {
        if (err) {
            console.error('Error creating Werkstatt:', err);
            res.sendStatus(500); // Internal Server Error
        } else {
            res.sendStatus(200); // OK
            console.log('Werkstatt successfully created for user ID:', userId);
        }
    });

    insertWerkstattStmt.finalize();
}

/**
 * This function updates the information of a 'fahrzeug' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {any} userData - Data containing information about the 'fahrzeug'
 * @param {express.Response} res - The Express response object
 */
export function setFahrzeugDaten(db: sqlite3.Database, userData: any, res: express.Response) {
    const updateFahrzeugInfoStmt = db.prepare(`
        UPDATE fahrzeug
        SET marke = ?, modell = ?
        WHERE fahrzeugid = ?;
    `);

    updateFahrzeugInfoStmt.run(userData.data.fahrzeugMarke, userData.data.fahrzeugModell, userData.data.fahrzeugid, (error) => {
        if (error) {
            console.error("Error updating Fahrzeuginfo:", error);
        } else {
            res.sendStatus(200);
            console.log("Fahrzeuginfo updated successfully");
        }
    });

    updateFahrzeugInfoStmt.finalize();
}

/**
 * This function updates the information of a 'werkstatt' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} userID - The user ID of the 'werkstatt' owner
 * @param {any} userData - Data containing information about the 'werkstatt'
 * @param {express.Response} res - The Express response object
 */
export function setWerkstattinfo(db: sqlite3.Database, userID: number, userData: any, res: express.Response) {
    const updateWerkstattInfoStmt = db.prepare(`
        UPDATE werkstatt 
        SET werkstattname = ?, postleitzahl = ?, stadt = ?, strasse = ?, hnr = ?, angebotenearbeiten = ?, herstellerspezialisierung = ?
        WHERE werkstatt.userid = ?
    `);

    updateWerkstattInfoStmt.run(
        userData.data.werkstattName, userData.data.plz, userData.data.stadt,
        userData.data.street, userData.data.hnr, userData.data.angeboteneArbeiten,
        userData.data.marke, userID,
        (error) => {
            if (error) {
                console.error("Error updating Werkstattinfo:", error);
            } else {
                res.sendStatus(200);
                console.log("Werkstattinfo updated successfully");
            }
        }
    );

    updateWerkstattInfoStmt.finalize();
}

/**
 * This function creates a new 'zusatzservice' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} lagerhalterID - The ID of the 'lagerhalter' offering the service
 * @param {any} userData - Data containing information about the additional service
 * @param {express.Response} res - The Express response object
 */
export function createService(db: sqlite3.Database, lagerhalterID: number, userData: any, res: express.Response) {
    const insertServiceStmt = db.prepare(`
        INSERT INTO zusatzservice (anbieter, bezeichnung, beschreibung, preis) 
        VALUES (?, ?, ?, ?);
    `);

    insertServiceStmt.run(
        lagerhalterID, userData.ServiceName, userData.ServiceBeschreibung, userData.ServicePreis,
        (err: any) => {
            if (err) {
                console.error('Error inserting new Service:', err);
                res.sendStatus(500); // Internal Server Error
            } else {
                res.sendStatus(200); // OK
                console.log('New Service successfully created');
            }
        }
    );

    insertServiceStmt.finalize();
}

/**
 * This function creates a new 'angebotsanfrage' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} einlagererID - The ID of the 'einlagerer' making the request
 * @param {number} kategorieID - The ID of the requested category
 * @param {number} lagerhalterID - The ID of the 'lagerhalter' receiving the request
 * @param {express.Response} res - The Express response object
 */
export function createAngebotsanfrage(db: sqlite3.Database, einlagererID: number, kategorieID: number, lagerhalterID: number, res: express.Response) {
    const insertAngebotsanfrageStmt = db.prepare(`
        INSERT INTO angebotsanfrage (einlagererid, lagerhalterid, kategorieid, beantwortet) 
        VALUES (?, ?, ?, ?);
    `);

    insertAngebotsanfrageStmt.run(
        einlagererID, lagerhalterID, kategorieID, 0,
        (err: any) => {
            if (err) {
                console.error('Error inserting new Angebot:', err);
                res.sendStatus(500); // Internal Server Error
            } else {
                res.sendStatus(200); // OK
                console.log('New Angebot successfully created');
            }
        }
    );

    insertAngebotsanfrageStmt.finalize();
}

/**
 * This function creates a new 'fahrzeug' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} stellplatzID - The ID of the 'stellplatz' where the vehicle is stored
 * @param {number} einlagererid - The ID of the 'einlagerer' owning the vehicle
 * @param {string} marke - The brand of the vehicle
 * @param {string} modell - The model of the vehicle
 * @param {express.Response} res - The Express response object
 */
export function createFahrzeug(db: sqlite3.Database, stellplatzID: number, einlagererid: number, marke: string, modell: string, res: express.Response) {
    const createFahrzeugStmt = db.prepare(`
        INSERT INTO fahrzeug (stellplatzid, einlagererid, marke, modell, fahrbereit, wartungsstand)
        VALUES (?, ?, ?, ?, ?, ?);
    `);

    createFahrzeugStmt.run(
        stellplatzID, einlagererid, marke, modell, 1, '',
        (err: any) => {
            if (err) {
                console.error('Error inserting new Fahrzeug:', err);
                res.sendStatus(500);
            } else {
                res.sendStatus(200);
                console.log('New Fahrzeug successfully created');
            }
        }
    );

    createFahrzeugStmt.finalize();
}

/**
 * This function toggles the availability of a 'stellplatz' in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} stellplatzID - The ID of the 'stellplatz' to update
 */
export function changeVerfuegbarkeit(db: sqlite3.Database, stellplatzID: number) {
    const updateVerfuegbarkeitStmt = db.prepare(`
        UPDATE stellplatz
        SET verfuegbarkeit =
        CASE 
            WHEN verfuegbarkeit = 1 THEN 0
            WHEN verfuegbarkeit = 0 THEN 1
        END
        WHERE stellplatzid = ?;
    `);

    updateVerfuegbarkeitStmt.run(stellplatzID, (err: any) => {
        if (err) {
            console.error('Error updating Verfuegbarkeit:', err);
        } else {
            console.log('Verfuegbarkeit von Stellplatz geändert');
        }
    });
}

/**
 * This function creates a new 'angebot' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} lagerhalterID - The ID of the 'lagerhalter' making the offer
 * @param {number} einlagererID - The ID of the 'einlagerer' receiving the offer
 * @param {number} stellplatzID - The ID of the 'stellplatz' associated with the offer
 * @param {string} inhalt - The content of the offer
 * @param {express.Response} res - The Express response object
 */
export function createAngebot(db: sqlite3.Database, lagerhalterID: number, einlagererID: number, stellplatzID: number, inhalt: string, res: express.Response) {
    const insertAngebotStmt = db.prepare(`
        INSERT INTO angebot (lagerhalterid, einlagererid, stellplatzid, inhalt)
        VALUES (?, ?, ? ,?);
    `);

    insertAngebotStmt.run(
        lagerhalterID, einlagererID, stellplatzID, inhalt,
        (err: any) => {
            if (err) {
                console.log('ERROR TEST');
                console.error('Error inserting new Angebot:', err);
                res.sendStatus(500);
            } else {
                console.log('New Angebot successfully created');
                res.sendStatus(200);
            }
        }
    );

    insertAngebotStmt.finalize();
}

/**
 * This function updates the information of a 'lager' entry in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 * @param {number} userID - The user ID of the 'lagerhalter' owning the 'lager'
 * @param {any} userData - Data containing information about the 'lager'
 * @param {express.Response} res - The Express response object
 */
export function setLagerDaten(db: sqlite3.Database, userID: number, userData: any, res: express.Response) {
    const updateLagerDatenStmt = db.prepare(`
        UPDATE lager
        SET servicezeiten = ?,
            plz = ?,
            stadt = ?,
            strasse = ?,
            hnr = ?,
            lagerspezialisierung = ?
        FROM lagerhalter
        WHERE lager.besitzer = lagerhalter.lagerhalterid AND lagerhalter.userid = ?;
    `);

    console.log(userData);
    updateLagerDatenStmt.run(
        userData.data.servicezeiten, userData.data.postleitzahl, userData.data.stadt,
        userData.data.strasse, userData.data.hausnummer, userData.data.marke, userID,
        (error) => {
            if (error) {
                console.error("Error updating Lagerdaten:", error);
            } else {
                console.log("Lagerdaten updated successfully");
                res.sendStatus(200);
            }
        }
    );

    updateLagerDatenStmt.finalize();
}
