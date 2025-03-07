import Lagerhalter from "./Lagerhalter.mjs";
import Werkstatt from "./Werkstatt.mjs";

/**
 * The class Werkstattanfragen represents a request which a workshop receives.
 * An instance of this class contains a {@link Lagerhalter} which sends the request and
 * a {@link Werkstatt} which receives the request.
 */
export default class Werkstattanfrage {
    private auftraggeber: Lagerhalter;
    private empfaenger: Werkstatt;
    private beschreibung: string;

    /**
     * The constructor of the class, which takes the parameters:
     * @param auftraggeber  The {@link Lagerhalter} which represents the client who sends the request
     * @param empfaenger    The {@link Werkstatt} which represents the receiver of the request
     * @param beschreibung  The content of the request
     * The access rights are set to @private
     */
    private constructor(auftraggeber: Lagerhalter, empfaenger: Werkstatt, beschreibung: string){
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
    public static createWerkstattanfrage(auftraggeber: Lagerhalter, empfaenger: Werkstatt, beschreibung: string):Werkstattanfrage{
        return new Werkstattanfrage(auftraggeber, empfaenger, beschreibung);
    }

    /**
     * The method returns the client who sends the request
     * @returns{Lagerhalter}
     */
    getStoragekeeper(): Lagerhalter{
        return this.auftraggeber
    }

}