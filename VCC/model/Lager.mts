import Lagerplatzkategorie from "./Lagerplatzkategorie.mjs";
import Lagerhalter from "./Lagerhalter.mjs";
import Stellplatz from "./Stellplatz.mjs";

/**
 * The class Lager represents a storage facility with different categories of storage spaces.
 * It includes properties such as storage categories, specialized manufacturer, service hours, and address details.
 * The class also provides methods to retrieve information about the storage facility and its categories.
 */
export default class Lager {
    // Properties
    private lagerplatzkategorien: Array<Lagerplatzkategorie>;
    private spezHersteller: string;
    private servicezeiten: string;
    private plz: string;
    private stadt: string;
    private strasse: string;
    private hnr: string;


    private constructor() {
    }

    /**
     * The method creates and returns an instance of Lager.
     * @returns {Lager} A new instance of Lager
     * The access rights are set to @public and the method is static.
     */
    public static createLager(): Lager {
        return new Lager();
    }

    /**
     * The method sets the data for the Lager, including specialized manufacturer, service hours, and address details.
     * @param spezHersteller The specialized manufacturer that the Lager is focused on
     * @param servicezeiten The service hours of the Lager
     * @param plz The postal code of the Lager's location
     * @param stadt The city of the Lager's location
     * @param hnr The house number of the Lager's location
     * @param strasse The street of the Lager's location
     */
    setLagerDaten(spezHersteller: string, servicezeiten: string, plz: string, stadt: string, hnr: string, strasse: string): void {
        this.spezHersteller = spezHersteller;
        this.servicezeiten = servicezeiten;
        this.plz = plz;
        this.stadt = stadt;
        this.hnr = hnr;
        this.strasse = strasse;
    }

    /**
     * The method returns the specialized manufacturer that the Lager is focused on.
     * @returns {string} The specialized manufacturer that the Lager is focused on
     */
    getSpezHersteller(): string {
        return this.spezHersteller;
    }

    /**
     * The method returns the service hours of the Lager.
     * @returns {string} The service hours of the Lager
     */
    getServiceZeiten(): string {
        return this.servicezeiten;
    }

    /**
     * The method returns the street of the Lager's location.
     * @returns {string} The street of the Lager's location
     */
    getStrasse(): string {
        return this.strasse;
    }

    /**
     * The method returns the postal code of the Lager's location.
     * @returns {string} The postal code of the Lager's location
     */
    getPLZ(): string {
        return this.plz;
    }

    /**
     * The method returns the city of the Lager's location.
     * @returns {string} The city of the Lager's location
     */
    getStadt(): string {
        return this.stadt;
    }

    /**
     * The method returns the house number of the Lager's location.
     * @returns {string} The house number of the Lager's location
     */
    getHNR(): string {
        return this.hnr;
    }

    /**
     * The method returns an array of all Stellplatz objects within the Lager, across all categories.
     * @returns {Array<Stellplatz>} An array of Stellplatz objects within the Lager
     */
    getParkingSpaces(): Array<Stellplatz> {
        let arr: Array<Stellplatz> = [];
        for (let i = 0; i < this.lagerplatzkategorien.length; i++) {
            for (let y = 0; y < this.lagerplatzkategorien[i].getParkingSpaces().length; y++) {
                arr.push(this.lagerplatzkategorien[i].getParkingSpaces()[y]);
            }
        }
        return arr;
    }

    /**
     * The method returns an array of Lagerplatzkategorie objects representing storage categories within the Lager.
     * @returns {Array<Lagerplatzkategorie>} An array of Lagerplatzkategorie objects
     */
    getStorageCategories(): Array<Lagerplatzkategorie> {
        return this.lagerplatzkategorien;
    }
}
