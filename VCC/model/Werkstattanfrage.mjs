/**
 * The class Werkstattanfragen represents a request which a workshop receives.
 * An instance of this class contains a {@link Lagerhalter} which sends the request and
 * a {@link Werkstatt} which receives the request.
 */
export default class Werkstattanfrage {
    /**
     * The constructor of the class, which takes the parameters:
     * @param auftraggeber  The {@link Lagerhalter} which represents the client who sends the request
     * @param empfaenger    The {@link Werkstatt} which represents the receiver of the request
     * @param beschreibung  The content of the request
     * The access rights are set to @private
     */
    constructor(auftraggeber, empfaenger, beschreibung) {
        this.auftraggeber = auftraggeber;
        this.empfaenger = empfaenger;
        this.beschreibung = beschreibung;
    }
    /**
     * The method creates an instance of the class {@link Werkstattanfrage} and returns it
     * @param auftraggeber  The {@link Lagerhalter} which represents the client who sends the request
     * @param empfaenger    The {@link Werkstatt} which represents the receiver of the request
     * @param beschreibung  The content of the request
     * @returns {Werkstattanfrage}
     */
    static createWerkstattanfrage(auftraggeber, empfaenger, beschreibung) {
        return new Werkstattanfrage(auftraggeber, empfaenger, beschreibung);
    }
    /**
     * The method returns the client who sends the request
     * @returns{Lagerhalter}
     */
    getStoragekeeper() {
        return this.auftraggeber;
    }
}
//# sourceMappingURL=Werkstattanfrage.mjs.map