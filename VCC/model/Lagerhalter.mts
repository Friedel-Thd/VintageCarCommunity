import Kontotyp from "./Kontotyp.mjs";
import Nutzer from "./Nutzer.mjs";
import Angebotsanfrage from "./Angebotsanfrage.mjs";
import Angebot from "./Angebot.mjs";
import Lager from "./Lager.mjs";
import Zusatzservice from "./Zusatzservice.mjs";
import Werkstattanfrage from "./Werkstattanfrage.mjs";
import Stellplatz from "./Stellplatz.mjs";
import Lagerplatzkategorie from "./Lagerplatzkategorie.mjs";


/**
 * The class Lagerhalter represents a storage space provider in the system, extending from Kontotyp.
 * It includes properties such as the user ID, additional services, offer requests, storage, and workshop requests.
 * The class also provides methods to interact with and manage various aspects of storage services.
 */
export default class Lagerhalter extends Kontotyp {
    private nutzerID: number;
    private zusatzservices: Array<Zusatzservice>;
    private angebotsanfragen: Array<Angebotsanfrage>;
    private angebote: Array<Angebot>;
    private lager: Lager;
    private werkstattanfragen: Array<Werkstattanfrage>;

    /**
     * The constructor of the class, which initializes the Lagerhalter object with the provided user ID.
     * @param nutzerID The user ID of the Lagerhalter
     * The constructor is set to @private.
     */
    private constructor(nutzerID: number) {
        super();
        this.nutzerID = nutzerID;
        this.lager = Lager.createLager();
    }

    /**
     * The method creates and returns an instance of Lagerhalter.
     * @param nutzer The Nutzer object representing the Lagerhalter
     * @returns {Lagerhalter} A new instance of Lagerhalter
     * The access rights are set to @public and the method is static.
     */
    public static createLagerhalter(nutzer: Nutzer):Lagerhalter{
        return new Lagerhalter(nutzer.getuserid());
    }

    /**
     * The method adds an Angebotsanfrage to the list of offer requests.
     * @param anfrage The Angebotsanfrage object representing the offer request
     */
    addAngebotsAnfrage(anfrage: Angebotsanfrage):void {
        this.angebotsanfragen.push(anfrage);
    }

    /**
     * The method returns formatted information about multiple Zusatzservices.
     * @returns {string} Formatted information about multiple Zusatzservices
     */
    getMultiServiceInfo():string {
        let multiInfo: string;
        for (let i=0; i<this.zusatzservices.length; i++){
            multiInfo+=this.zusatzservices[i].getFormattedInfo();
        }
        return multiInfo;
    }

    /**
     * The method returns formatted information about a single Zusatzservice based on its service ID.
     * @param serviceID The service ID of the Zusatzservice
     * @returns {string} Formatted information about the specified Zusatzservice
     */
    getSingleServiceInfo(serviceID: number):string{
        for (let i=0; i<this.zusatzservices.length; i++){
            if (this.zusatzservices[i].getServiceID()==serviceID) {
                return this.zusatzservices[i].getFormattedInfo();
            }
        }
        return "Service not found!!!";
    }

    /**
     * The method returns an array of Stellplatz objects representing parking spaces within the Lager.
     * @returns {Array<Stellplatz>} An array of Stellplatz objects
     */
    getParkingSpaces(): Array<Stellplatz> {
        return this.lager.getParkingSpaces();
    }

    /**
     * The method returns a Stellplatz object with the specified ID within the Lager.
     * @param id The ID of the Stellplatz to retrieve
     * @returns {Stellplatz|null} The Stellplatz object with the specified ID, or null if not found
     */
    getParkingSpace(id:number):Stellplatz|null{
        for (let i=0; i<this.lager.getParkingSpaces().length; i++) {
            if (this.lager.getParkingSpaces()[i].getParkingSpaceID() == id) {
                return this.lager.getParkingSpaces()[i];
            }
        }
        return null;
    }

    /**
     * The method returns an array of additional services offered by the Lagerhalter.
     * @returns {Array<Zusatzservice>} An array of Zusatzservice objects
     */
    getAdditionalServices():Array<Zusatzservice>{
        return this.zusatzservices;
    }

    /**
     * The method returns a specific additional service based on its service ID.
     * @param serviceID The service ID of the Zusatzservice to retrieve
     * @returns {Zusatzservice|null} The Zusatzservice object with the specified ID, or null if not found
     */
    getAdditionalService(serviceID: number):Zusatzservice|null{
        for (let i=0; i<this.zusatzservices.length; i++){
            if (this.zusatzservices[i].getServiceID()==serviceID){
                return this.zusatzservices[i];
            }
        }
        return null;
    }

    /**
     * The method books an additional service for a specific parking space.
     * @param service The Zusatzservice to be booked
     * @param parkingSpaceID The ID of the Stellplatz where the booking is to be made
     */
    bookAdditionalService(service: Zusatzservice, parkingSpaceID: number):void{
        this.getParkingSpace(parkingSpaceID).addBockedService(service);
    }

    /**
     * The method returns the Lager object associated with the Lagerhalter.
     * @returns {Lager} The Lager object associated with the Lagerhalter
     */
    getStorage():Lager{
        return this.lager;
    }

    /**
     * The method returns an array of Werkstattanfrage objects representing workshop requests.
     * @returns {Array<Werkstattanfrage>} An array of Werkstattanfrage objects
     */
    getWorkshopRequests():Array<Werkstattanfrage>{
        return this.werkstattanfragen;
    }

    /**
     * The method returns an array of Angebotsanfrage objects representing offer requests.
     * @returns {Array<Angebotsanfrage>} An array of Angebotsanfrage objects
     */
    getOfferRequests():Array<Angebotsanfrage>{
        return this.angebotsanfragen;
    }

    /**
     * The method returns an array of Lagerplatzkategorie objects representing storage categories within the Lager.
     * @returns {Array<Lagerplatzkategorie>} An array of Lagerplatzkategorie objects
     */
    getStorageCategories():Array<Lagerplatzkategorie>{
        return this.lager.getStorageCategories();
    }

}