/**
 * The class Angebot represents an offer with properties such as Angebotsanfrage, parking space owner, offer recipient, parking space, and status.
 */
export default class Angebot {
    /**
     * The constructor of the class, which initializes an Angebot object with the specified Angebotsanfrage, parking space owner, offer recipient, and parking space.
     * @param angebotsanfrage The Angebotsanfrage associated with the offer
     * @param stellplatzbesitz The Lagerhalter who owns the parking space
     * @param angebotsempfaenger The Einlagerer who receives the offer
     * @param platz The Stellplatz associated with the offer
     * The access rights are set to @public.
     */
    constructor(angebotsanfrage, stellplatzbesitz, angebotsempfaenger, platz) {
        this.angebotsanfrage = angebotsanfrage;
        this.stellplatzbesitz = stellplatzbesitz;
        this.angebotsempfaenger = angebotsempfaenger;
        this.platz = platz;
        this.beantwortet = false;
    }
    /**
     * The method returns the Angebotsanfrage associated with the Angebot.
     * @returns {Angebotsanfrage} The Angebotsanfrage associated with the offer
     */
    getAngebotsanfrage() {
        return this.angebotsanfrage;
    }
    /**
     * The method returns the Lagerhalter who owns the parking space associated with the Angebot.
     * @returns {Lagerhalter} The Lagerhalter who owns the parking space
     */
    getStellplatzbesitz() {
        return this.stellplatzbesitz;
    }
    /**
     * The method returns the Einlagerer who receives the Angebot.
     * @returns {Einlagerer} The Einlagerer who receives the offer
     */
    getAngebotsempfaenger() {
        return this.angebotsempfaenger;
    }
    /**
     * The method returns the Stellplatz associated with the Angebot.
     * @returns {Stellplatz} The Stellplatz associated with the offer
     */
    getPlatz() {
        return this.platz;
    }
    /**
     * The method returns a boolean indicating whether the Angebot has been answered.
     * @returns {boolean} A boolean indicating whether the offer has been answered
     */
    isBeantwortet() {
        return this.beantwortet;
    }
    /**
     * The method sets the status of the Angebot to answered.
     */
    setBeantwortet() {
        this.beantwortet = true;
    }
}
//# sourceMappingURL=Angebot.mjs.map