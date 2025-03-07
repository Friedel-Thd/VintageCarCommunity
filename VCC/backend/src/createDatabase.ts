import sqlite3 from "sqlite3";

/**
 * The function creates the necessary tables in the database.
 * @param {sqlite3.Database} db - The SQLite database instance
 */
export function createDatabase(db: sqlite3.Database) {
    db.serialize(() => {
        // Enable foreign key support
        db.run(`
            PRAGMA foreign_keys = ON
        `);

        // Define the 'nutzer' table
        db.run(`
            CREATE TABLE IF NOT EXISTS nutzer (
                userid INTEGER PRIMARY KEY,
                email TEXT NOT NULL,
                passwort TEXT NOT NULL,
                vorname TEXT NOT NULL,
                nachname TEXT NOT NULL,
                telefonnummer TEXT NOT NULL,
                stadt TEXT NOT NULL,
                plz INTEGER NOT NULL,
                strasse TEXT NOT NULL,
                hnr TEXT NOT NULL
            )
        `);

        // Define the 'lagerhalter' table
        db.run(`
            CREATE TABLE IF NOT EXISTS lagerhalter (
                lagerhalterid INTEGER PRIMARY KEY,
                userid INTEGER NOT NULL,
                FOREIGN KEY (userid) REFERENCES nutzer(userid) ON DELETE CASCADE
            )
        `);

        // Define the 'einlagerer' table
        db.run(`
            CREATE TABLE IF NOT EXISTS einlagerer (
                einlagererid INTEGER PRIMARY KEY,
                userid INTEGER NOT NULL,
                FOREIGN KEY (userid) REFERENCES nutzer(userid) ON DELETE CASCADE
            )
        `);

        // Define the 'stadt' table
        db.run(`
            CREATE TABLE IF NOT EXISTS stadt (
                stadtid INTEGER PRIMARY KEY,
                stadtname TEXT NOT NULL
            )
        `);

        // Define the 'werkstatt' table
        db.run(`
            CREATE TABLE IF NOT EXISTS werkstatt (
                werkstattid INTEGER PRIMARY KEY,
                userid INTEGER NOT NULL,
                werkstattname TEXT,
                postleitzahl INTEGER,
                stadt TEXT,
                strasse TEXT,
                hnr TEXT,
                angebotenearbeiten TEXT,
                herstellerspezialisierung TEXT,
                FOREIGN KEY (userid) REFERENCES nutzer(userid) ON DELETE CASCADE
            )
        `);

        // Define the 'werkstattanfrage' table
        db.run(`
            CREATE TABLE IF NOT EXISTS werkstattanfrage (
                wanfrageid INTEGER PRIMARY KEY,
                lagerhalterid INTEGER NOT NULL,
                werkstattid INTEGER NOT NULL,
                auftragsbeschreibung INTEGER NOT NULL,
                FOREIGN KEY (lagerhalterid) REFERENCES lagerhalter(lagerhalterid) ON DELETE CASCADE,
                FOREIGN KEY (werkstattid) REFERENCES werkstatt(werkstattid) ON DELETE CASCADE
            )
        `);

        // Define the 'marke' table
        db.run(`
            CREATE TABLE IF NOT EXISTS marke (
                markenid INTEGER PRIMARY KEY,
                markenname TEXT NOT NULL
            )
        `);

        // Define the 'lagerbedingung' table
        db.run(`
            CREATE TABLE IF NOT EXISTS lagerbedingung (
                bedingungid INTEGER PRIMARY KEY,
                bezeichnung TEXT NOT NULL
            )
        `);

        // Define the 'nutzernachrichten' table
        db.run(`
            CREATE TABLE IF NOT EXISTS nutzernachrichten (
                messageid INTEGER PRIMARY KEY,
                absender INTEGER NOT NULL,
                empfaenger INTEGER NOT NULL,
                datum REAL NOT NULL,
                inhalt TEXT NOT NULL,
                FOREIGN KEY (absender) REFERENCES nutzer(userid) ON DELETE CASCADE,
                FOREIGN KEY (empfaenger) REFERENCES nutzer(userid) ON DELETE CASCADE
            )
        `);

        // Define the 'zusatzservice' table
        db.run(`
            CREATE TABLE IF NOT EXISTS zusatzservice (
                zusatzid INTEGER PRIMARY KEY,
                anbieter INTEGER NOT NULL,
                bezeichnung TEXT NOT NULL,
                beschreibung TEXT NOT NULL,
                preis REAL NOT NULL,
                FOREIGN KEY (anbieter) REFERENCES lagerhalter(lagerhalterid) ON DELETE CASCADE
            )
        `);

        // Define the 'lager' table
        db.run(`
            CREATE TABLE IF NOT EXISTS lager (
                lagerid INTEGER PRIMARY KEY,
                besitzer INTEGER,
                servicezeiten TEXT,
                plz INTEGER,
                stadt TEXT,
                strasse TEXT,
                hnr TEXT,
                lagerspezialisierung TEXT,
                FOREIGN KEY (besitzer) REFERENCES lagerhalter(lagerhalterid) ON DELETE CASCADE
            )
        `);

        // Define the 'lagerplatzkategorie' table
        db.run(`
            CREATE TABLE IF NOT EXISTS lagerplatzkategorie (
                kategorieid INTEGER PRIMARY KEY,
                lagerid INTEGER NOT NULL,
                bezeichnung TEXT NOT NULL,
                platzzahl INTEGER NOT NULL,
                kosten REAL NOT NULL,
                FOREIGN KEY (lagerid) REFERENCES lager(lagerid) ON DELETE CASCADE
            )
        `);

        // Define the 'kategoriebedingungen' table
        db.run(`
            CREATE TABLE IF NOT EXISTS kategoriebedingungen (
                kategorieid INTEGER NOT NULL,
                bedingungid INTEGER NOT NULL,
                PRIMARY KEY (kategorieid, bedingungid),
                FOREIGN KEY (kategorieid) REFERENCES lagerplatzkategorie(kategorieid) ON DELETE CASCADE,
                FOREIGN KEY (bedingungid) REFERENCES lagerbedingung(bedingungid) ON DELETE CASCADE
            )
        `);

        // Define the 'stellplatz' table
        db.run(`
            CREATE TABLE IF NOT EXISTS stellplatz (
                stellplatzid INTEGER PRIMARY KEY,
                verfuegbarkeit INTEGER NOT NULL,
                kategorieid INTEGER NOT NULL,
                FOREIGN KEY (kategorieid) REFERENCES lagerplatzkategorie(kategorieid) ON DELETE CASCADE
            )
        `);

        // Define the 'stellplatzgebuchteservices' table
        db.run(`
            CREATE TABLE IF NOT EXISTS stellplatzgebuchteservices (
                stellplatzid INTEGER NOT NULL,
                serviceid INTEGER NOT NULL,
                PRIMARY KEY (stellplatzid, serviceid),
                FOREIGN KEY (stellplatzid) REFERENCES stellplatz(stellplatzid) ON DELETE CASCADE,
                FOREIGN KEY (serviceid) REFERENCES zusatzservices(serviceid) ON DELETE CASCADE
            )
        `);

        // Define the 'fahrzeug' table
        db.run(`
            CREATE TABLE IF NOT EXISTS fahrzeug (
                fahrzeugid INTEGER PRIMARY KEY,
                stellplatzid INTEGER NOT NULL,
                einlagererid INTEGER NOT NULL,
                marke TEXT NOT NULL,
                modell TEXT NOT NULL,
                fahrbereit INTEGER NOT NULL,
                wartungsstand TEXT NOT NULL,
                FOREIGN KEY (stellplatzid) REFERENCES stellplatz(stellplatzid) ON DELETE CASCADE,
                FOREIGN KEY (einlagererid) REFERENCES einlagerer(einlagererid) ON DELETE CASCADE
            )
        `);

        // Define the 'angebotsanfrage' table
        db.run(`
            CREATE TABLE IF NOT EXISTS angebotsanfrage (
                anfrageid INTEGER PRIMARY KEY,
                einlagererid INTEGER NOT NULL,
                lagerhalterid INTEGER NOT NULL,
                kategorieid INTEGER NOT NULL,
                beantwortet INTEGER NOT NULL,
                FOREIGN KEY (lagerhalterid) REFERENCES lagerhalter(lagerhalterid) ON DELETE CASCADE,
                FOREIGN KEY (einlagererid) REFERENCES einlagerer(einlagererid) ON DELETE CASCADE,
                FOREIGN KEY (kategorieid) REFERENCES lagerplatzkategorie(kategorieid) ON DELETE CASCADE
            )
        `);

        // Define the 'angebot' table
        db.run(`
            CREATE TABLE IF NOT EXISTS angebot (
                angebotid INTEGER PRIMARY KEY,
                lagerhalterid INTEGER NOT NULL,
                einlagererid INTEGER NOT NULL,
                stellplatzid INTEGER NOT NULL,
                inhalt TEXT,
                FOREIGN KEY (lagerhalterid) REFERENCES lagerhalter(lagerhalterid) ON DELETE CASCADE,
                FOREIGN KEY (einlagererid) REFERENCES einlagerer(einlagererid) ON DELETE CASCADE,
                FOREIGN KEY (stellplatzid) REFERENCES stellplatz(stellplatzid) ON DELETE CASCADE
            )
        `);
    });
}

/**
 * The function fills the database with initial data.
 * @param {sqlite3.Database} db - The SQLite database instance
 */
export function fillDatabase(db: sqlite3.Database) {
    // Insert data into the 'marke' table
    db.run(`
            INSERT INTO marke (markenname)
            VALUES
            ('Mercedes'),
            ('Volkswagen'),
            ('Porsche'),
            ('BMW'),
            ('Opel'),
            ('Audi'),
            ('Ford'),
            ('Chevrolet'),
            ('Jaguar'),
            ('Ferrari')
        `);

    // Insert data into the 'stadt' table
    db.run(`
            INSERT INTO stadt (stadtname)
            VALUES
            ('Berlin'),
            ('Hamburg'),
            ('München'),
            ('Köln'),
            ('Frankfurt am Main'),
            ('Stuttgart'),
            ('Düsseldorf'),
            ('Dortmund'),
            ('Essen'),
            ('Leipzig'),
            ('Bremen'),
            ('Dresden'),
            ('Hannover'),
            ('Nürnberg'),
            ('Duisburg'),
            ('Bochum'),
            ('Wuppertal'),
            ('Bielefeld'),
            ('Bonn'),
            ('Gießen')
        `);

    // Insert data into the 'lagerbedingung' table
    db.run(`
        INSERT INTO lagerbedingung (bezeichnung)
        VALUES
            ('beheizt'),
            ('UV_Geschützt'),
            ('Klimatisiert'),
            ('24H_Zugang'),
            ('Staubschutz'),
            ('Feuchtigkeitskontrolle')
    `);
}
