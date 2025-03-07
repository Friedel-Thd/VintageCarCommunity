import Kontotyp from "./Kontotyp.mjs";
/**
 * The class Werkstatt represents a workshop.
 * Each instance is able to offer different kinds of repair or maintenance services.
 * Each instance of the class {@link Lagerhalter} is able to send a request to an instance of the class Werkstatt.
 */
export default class Werkstatt extends Kontotyp {
    /**
     *The constructor of the class, which takes the parameters:
     * @param nutzerID  A id which is used to identify the user which represents the workshop
     * The access rights are set to: @private
     */
    constructor(nutzerID) {
        super();
        this.nutzerID = nutzerID;
    }
    /**
     *The method creates an instance of the class Werkstatt and returns it.
     * @param nutzer    The user which represents the workshop
     * @returns {Werkstatt}
     */
    static createWerkstatt(nutzer) {
        return new Werkstatt(nutzer.getuserid());
    }
    /**
     *The method returns a formatted string which contains every information which is needed to
     * represent a workshop.
     * @returns {string}
     */
    getWorkshopInfo() {
        let info;
        info = "Werkstattname: " + this.werkstattname + "\nPlz: " + this.plz + "\nStadt: " + this.stadt + "\nStraße: " + this.strasse + "\nHausnummer: " + this.hausnummer;
        info += "\nSpezialisierter Hersteller: " + this.spezHersteller + "\nAngebotene Arbeiten: " + this.angeboteneArbeiten;
        return info;
    }
    /**
     * The method returns an array of every request {@link Werkstattanfrage}
     * the workshop has ever received
     * @returns {Array<Werkstattanfrage>}
     */
    getWorkshopOffers() {
        return this.werkstattanfragen;
    }
    /**
     * The method sets the workshop information passed by the User {@link Nutzer} which represents the workshop
     * @param name  The workshop name
     * @param hersteller    The manufacturer which the workshop is specialised on
     * @param angeboteneArbeiten    The offered services
     * @param plz   The postal code of the workshop
     * @param stadt The city in which the workshop is located
     * @param strasse   The street in which the workshop is located
     * @param hausnummer    The house number of the building which the workshop is located
     */
    setWorkshopInfo(name, hersteller, angeboteneArbeiten, plz, stadt, strasse, hausnummer) {
        this.werkstattname = name;
        this.spezHersteller = hersteller;
        this.angeboteneArbeiten = angeboteneArbeiten;
        this.plz = plz;
        this.stadt = stadt;
        this.strasse = strasse;
        this.hausnummer = hausnummer;
    }
    /**
     * The method returns the workshop name
     * @returns {string}
     */
    getWerkstattname() {
        return this.werkstattname;
    }
    /**
     * The method returns the number of the building which the workshop is located
     * @returns {string}
     */
    getHausnummer() {
        return this.hausnummer;
    }
    /**
     * The method returns the street of the workshop address
     * @returns {string}
     */
    getStrasse() {
        return this.strasse;
    }
    /**
     * The method returns the postal code of the workshop address
     * @returns {string}
     */
    getPlz() {
        return this.plz;
    }
    /**
     * The method returns the city of the workshop address
     * @returns {string}
     */
    getStadt() {
        return this.stadt;
    }
    /**
     * The method returns the manufacturer which the workshop is specialised on
     * @returns {string}
     */
    getSpezHersteller() {
        return this.spezHersteller;
    }
    /**
     * The method returns the offered services
     * @returns {string}
     */
    getAngeboteneArbeiten() {
        return this.angeboteneArbeiten;
    }
    /**
     * The method takes a workshop request and pushes it on to the request list {@link Array}
     * @param anfrage The workshop request which is pushed
     */
    addToWerkstattanfragen(anfrage) {
        this.werkstattanfragen.push(anfrage);
    }
}
//# sourceMappingURL=Werkstatt.mjs.map