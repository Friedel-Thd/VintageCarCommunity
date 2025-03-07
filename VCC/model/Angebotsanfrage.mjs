/**
 * The class Angebotsanfrage represents a request for an offer with properties such as Angebot, receiver, requester, parking space, and status.
 */
export default class Angebotsanfrage {
    /**
     * The constructor of the class, which initializes an Angebotsanfrage object with the specified Angebot, receiver, requester, and parking space.
     * @param angebot The Angebot associated with the request
     * @param empfaenger The Lagerhalter who receives the request
     * @param anfragensteller The Einlagerer who made the request
     * @param platz The Stellplatz associated with the request
     * The access rights are set to @public.
     */
    constructor(angebot, empfaenger, anfragensteller, platz) {
        this.angebot = angebot;
        this.empfaenger = empfaenger;
        this.anfragensteller = anfragensteller;
        this.platz = platz;
        this.beantwortet = false;
    }
    /**
     * The method returns the Angebot associated with the Angebotsanfrage.
     * @returns {Angebot} The Angebot associated with the request
     */
    getAngebot() {
        return this.angebot;
    }
    /**
     * The method returns the Lagerhalter who receives the Angebotsanfrage.
     * @returns {Lagerhalter} The Lagerhalter who receives the request
     */
    getEmpfaenger() {
        return this.empfaenger;
    }
    /**
     * The method returns the Einlagerer who made the Angebotsanfrage.
     * @returns {Einlagerer} The Einlagerer who made the request
     */
    getAnfragensteller() {
        return this.anfragensteller;
    }
    /**
     * The method returns the Stellplatz associated with the Angebotsanfrage.
     * @returns {Stellplatz} The Stellplatz associated with the request
     */
    getPlatz() {
        return this.platz;
    }
    /**
     * The method returns a boolean indicating whether the Angebotsanfrage has been answered.
     * @returns {boolean} A boolean indicating whether the request has been answered
     */
    isBeantwortet() {
        return this.beantwortet;
    }
    /**
     * The method sets the status of the Angebotsanfrage to answered.
     */
    setBeantwortet() {
        this.beantwortet = true;
    }
}
//# sourceMappingURL=Angebotsanfrage.mjs.map