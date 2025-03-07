/**
 * The class Lager represents a storage facility with different categories of storage spaces.
 * It includes properties such as storage categories, specialized manufacturer, service hours, and address details.
 * The class also provides methods to retrieve information about the storage facility and its categories.
 */
export default class Lager {
    constructor() {
    }
    /**
     * The method creates and returns an instance of Lager.
     * @returns {Lager} A new instance of Lager
     * The access rights are set to @public and the method is static.
     */
    static createLager() {
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
    setLagerDaten(spezHersteller, servicezeiten, plz, stadt, hnr, strasse) {
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
    getSpezHersteller() {
        return this.spezHersteller;
    }
    /**
     * The method returns the service hours of the Lager.
     * @returns {string} The service hours of the Lager
     */
    getServiceZeiten() {
        return this.servicezeiten;
    }
    /**
     * The method returns the street of the Lager's location.
     * @returns {string} The street of the Lager's location
     */
    getStrasse() {
        return this.strasse;
    }
    /**
     * The method returns the postal code of the Lager's location.
     * @returns {string} The postal code of the Lager's location
     */
    getPLZ() {
        return this.plz;
    }
    /**
     * The method returns the city of the Lager's location.
     * @returns {string} The city of the Lager's location
     */
    getStadt() {
        return this.stadt;
    }
    /**
     * The method returns the house number of the Lager's location.
     * @returns {string} The house number of the Lager's location
     */
    getHNR() {
        return this.hnr;
    }
    /**
     * The method returns an array of all Stellplatz objects within the Lager, across all categories.
     * @returns {Array<Stellplatz>} An array of Stellplatz objects within the Lager
     */
    getParkingSpaces() {
        let arr = [];
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
    getStorageCategories() {
        return this.lagerplatzkategorien;
    }
}
//# sourceMappingURL=Lager.mjs.map