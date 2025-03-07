import Stellplatz from "./Stellplatz.mjs";
import Lager from "./Lager.mjs";
import Zusatzservice from "./Zusatzservice.mjs";
import Lagerhalter from "./Lagerhalter.mjs";

/**
 * The class Lagerplatzkategorie represents a category of storage spaces within a Lager.
 * It includes properties such as category name, storage conditions, available spaces, and associated costs.
 * The class also provides methods to interact with and manage storage spaces within the category.
 */
export default class Lagerplatzkategorie {
    private id: number;
    private lager: Lager;
    private stellplaetze: Array<Stellplatz>;
    private name: string;
    private lagerbedingungen: Array<string>;
    private platzzahl: number;
    private freiePlaetze: number;
    private kosten: number;

    /**
     * The constructor of the class, which initializes the Lagerplatzkategorie object with the provided parameters.
     * @param name The name of the storage category
     * @param lagerbedingungen The storage conditions for the category
     * @param platzzahl The total number of storage spaces in the category
     * @param id The unique identifier for the category
     * The constructor is set to @private.
     */
    private constructor(name: string, lagerbedingungen: string[], platzzahl: number, id: number) {
        this.name = name;
        this.lagerbedingungen = lagerbedingungen;
        this.platzzahl = platzzahl;
        this.freiePlaetze = platzzahl;
        this.id=id;
    }

    /**
     * The method creates and returns an instance of Lagerplatzkategorie.
     * @param name The name of the storage category
     * @param lagerbedingungen The storage conditions for the category
     * @param platzzahl The total number of storage spaces in the category
     * @param id The unique identifier for the category
     * @returns {Lagerplatzkategorie} A new instance of Lagerplatzkategorie
     * The access rights are set to @public and the method is static.
     */
    public static createCategory(name: string, lagerbedingungen: string[], platzzahl: number, id:number): Lagerplatzkategorie{
        return new Lagerplatzkategorie(name, lagerbedingungen, platzzahl, id);
    }

    /**
     * The method sets the name and storage conditions for the storage category.
     * @param name The new name for the storage category
     * @param lagerbedingungen The new storage conditions for the category
     */
    setStorageCategory(name: string, lagerbedingungen: string[]){
        this.name = name;
        this.lagerbedingungen = lagerbedingungen
    }

    //TODO implement. but in what form?
    /**
     * The method returns information about the storage category.
     * @returns {string} Information about the storage category
     */
    getStorageCatInfo(): string{
        return
    }

    //TODO needs a Lagerhalter property
    /**
     * The method returns the Lagerhalter associated with the storage category.
     * @returns {Lagerhalter} The Lagerhalter associated with the storage category
     */
    getStorageKeeper(): Lagerhalter{
        return
    }

    /**
     * The method reduces the number of available spaces in the storage category by 1.
     */
    reduceFreeSpaces(){
        this.freiePlaetze -= 1;
    }

    /**
     * The method returns the Stellplatz object with the specified ID within the storage category.
     * @param id The ID of the Stellplatz to retrieve
     * @returns {Stellplatz} The Stellplatz object with the specified ID
     */
    getParkingSpace(id: number): Stellplatz{
        return this.stellplaetze[id]
    }

    //TODO implement
    /**
     * The method executes a booking for a Zusatzservice at a specific Stellplatz within the storage category.
     * @param service The Zusatzservice to be booked
     * @param prkSpId The ID of the Stellplatz where the booking is to be made
     * @returns {boolean} True if the booking is successful, otherwise false
     */
    executeBooking(service: Zusatzservice, prkSpId: number): boolean{
        return
    }

    /**
     * The method returns an array of all Stellplatz objects within the storage category.
     * @returns {Array<Stellplatz>} An array of Stellplatz objects within the storage category
     */
    getParkingSpaces():Array<Stellplatz>{
        return this.stellplaetze;
    }

}