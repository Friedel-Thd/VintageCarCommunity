import Kontotyp from "./Kontotyp.mjs";
import Angebot from "./Angebot.mjs";
import Fahrzeug from "./Fahrzeug.mjs";
import Angebotsanfrage from "./Angebotsanfrage.mjs";
import Nutzer from "./Nutzer.mjs";

/**
 * The class Einlagerer represents a user type specialized for storage with properties such as userID, vehicles, offers, and offer requests.
 * It extends the Kontotyp abstract class, indicating that it is a specific type of account.
 */
export default class Einlagerer extends Kontotyp {
    // Properties
    private nutzerID: number;
    private fahrzeuge: Array<Fahrzeug>;
    private angebote: Array<Angebot>;
    private angebotsanfragen: Array<Angebotsanfrage>;

    /**
     * The constructor of the class, which initializes an Einlagerer object with the specified user ID.
     * @param nutzerID The user ID of the Einlagerer
     * The access rights are set to @private.
     */
    private constructor(nutzerID: number) {
        super();
        this.nutzerID = nutzerID;
        this.fahrzeuge = [];
        this.angebote = [];
        this.angebotsanfragen = [];
    }

    /**
     * The method creates and returns an instance of Einlagerer with the specified user.
     * @param nutzer The user for whom Einlagerer account is created
     * @returns {Einlagerer} A new instance of Einlagerer
     * The access rights are set to @public and the method is static.
     */
    public static createEinlagerer(nutzer: Nutzer): Einlagerer {
        return new Einlagerer(nutzer.getuserid());
    }

    /**
     * The method adds an Angebot to the list of Angebot objects associated with the Einlagerer.
     * @param anfrage The Angebot object to be added
     */
    addToAngebotsanfragen(anfrage: Angebotsanfrage): void {
        this.angebotsanfragen.push(anfrage);
    }

    /**
     * The method returns an array of Angebot objects associated with the Einlagerer.
     * @returns {Array<Angebot>} An array of Angebot objects associated with the Einlagerer
     */
    getOffers(): Array<Angebot> {
        return this.angebote;
    }

    /**
     * The method returns an array of Fahrzeug objects associated with the Einlagerer.
     * @returns {Array<Fahrzeug>} An array of Fahrzeug objects associated with the Einlagerer
     */
    getCars(): Array<Fahrzeug> {
        return this.fahrzeuge;
    }

    /**
     * The method returns formatted information about a specific Fahrzeug object associated with the Einlagerer.
     * @param index The index of the Fahrzeug object in the array
     * @returns {string} Formatted information about the specified Fahrzeug object
     */
    getCarInformation(index: number): string {
        return this.fahrzeuge[index].getInformation();
    }

    /**
     * The method adds a Fahrzeug object to the list of Fahrzeug objects associated with the Einlagerer.
     * @param fahrzeug The Fahrzeug object to be added
     */
    addCar(fahrzeug: Fahrzeug): void {
        this.fahrzeuge.push(fahrzeug);
    }

    /**
     * The method edits the information of a specific Fahrzeug object associated with the Einlagerer.
     * @param index The index of the Fahrzeug object in the array
     * @param marke The new brand information
     * @param modell The new model information
     */
    editCarInformation(index: number, marke: string, modell: string): void {
        this.fahrzeuge[index].editInformation(marke, modell);
    }
}
