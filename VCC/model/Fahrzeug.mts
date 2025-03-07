import Stellplatz from "./Stellplatz.mjs";

/**
 * The class Fahrzeug represents a vehicle with properties such as brand, model, status, maintenance level, and assigned parking space.
 */
export default class Fahrzeug {
    // Properties
    private marke: string;
    private modell: string;
    private fahrbereit: boolean;
    private wartungsstand: string;
    private stellplatz: Stellplatz;

    /**
     * The constructor of the class, which initializes the Fahrzeug object with the specified brand, model, and assigned parking space.
     * @param marke The brand of the vehicle
     * @param modell The model of the vehicle
     * @param stellplatz The assigned parking space for the vehicle
     * The access rights are set to @private.
     */
    private constructor(marke: string, modell: string, stellplatz: Stellplatz) {
        this.marke = marke;
        this.modell = modell;
        this.fahrbereit = true;
        this.wartungsstand = "";
        this.stellplatz = stellplatz;
    }

    /**
     * The method creates and returns an instance of Fahrzeug with the specified brand, model, and assigned parking space.
     * @param marke The brand of the vehicle
     * @param modell The model of the vehicle
     * @param stellplatz The assigned parking space for the vehicle
     * The access rights are set to @public and the method is static.
     */
    public static createCar(marke: string, modell: string, stellplatz: Stellplatz): Fahrzeug {
        return new Fahrzeug(marke, modell, stellplatz);
    }

    /**
     * The method sets the status and maintenance level of the vehicle.
     * @param fahrbereit The status indicating whether the vehicle is ready to drive
     * @param wartungsstand The maintenance level of the vehicle
     */
    setCarStatus(fahrbereit: boolean, wartungsstand: string): void {
        this.fahrbereit = fahrbereit;
        this.wartungsstand = wartungsstand;
    }

    /**
     * The method returns a formatted string containing information about the vehicle.
     * @returns {string} A formatted string containing information about the vehicle
     */
    getInformation(): string {
        return `${this.marke} ${this.modell} ${this.fahrbereit} ${this.wartungsstand} ${this.stellplatz}`;
    }

    /**
     * The method returns the brand of the vehicle.
     * @returns {string} The brand of the vehicle
     */
    getMarke(): string {
        return this.marke;
    }

    /**
     * The method returns the model of the vehicle.
     * @returns {string} The model of the vehicle
     */
    getModell(): string {
        return this.modell;
    }

    /**
     * The method updates the brand and model information of the vehicle.
     * @param marke The new brand of the vehicle
     * @param modell The new model of the vehicle
     */
    editInformation(marke: string, modell: string): void {
        this.marke = marke;
        this.modell = modell;
    }
}
