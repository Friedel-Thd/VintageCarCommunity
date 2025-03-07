import Fahrzeug from "./Fahrzeug.mjs";
import Lagerplatzkategorie from "./Lagerplatzkategorie.mjs";
import Zusatzservice from "./Zusatzservice.mjs";

/**
 * The class Stellplatz represents a parking place in a storage.
 * An instance of this class contains a {@link Lagerplatzkategorie} which classifies it and
 * a list ({@link Array}) of {@link Zusatzservice} which represents the booked services
 */
export default class Stellplatz {
    private lagerplatzkategorie: Lagerplatzkategorie;
    private gebuchteServices: Array<Zusatzservice>;
    private verfuegbar: boolean;
    private platznummer: number;

    /**
     * The constructor of this class, which takes the parameters:
     * @param lagerplatzkategorie   The category which classifies the parking place
     * @param platznummer   The parking place number
     * The boolean flag is set to true by default
     * The access rights are set to @private
     */
    private constructor(lagerplatzkategorie: Lagerplatzkategorie, platznummer: number) {
        this.lagerplatzkategorie = lagerplatzkategorie;
        this.platznummer = platznummer;
        this.verfuegbar = true;
    }

    /**
     * The method creates an instance of {@link Stellplatz} and returns it
     * @param lagerplatzkategorie   The category which classifies the instance
     * @param platznummer   The parking place number
     * @returns {Stellplatz}
     */
    //TODO implement this
    public static createParkingSpace(lagerplatzkategorie: Lagerplatzkategorie, platznummer: number): Stellplatz{
        return new Stellplatz(lagerplatzkategorie, platznummer)
    }

    /**
     * The method calls the method {@link createCar} and returns an instance of the class {@link Fahrzeug}
     * @param marke The brand of the car
     * @param modell    The model of the car
     * @param stellplatz    The parking place of the car (instance of class {@link Stellplatz})
     * @returns {Fahrzeug}
     */
    createCar(marke: string, modell: string, stellplatz: Stellplatz): Fahrzeug{
        return Fahrzeug.createCar(marke, modell, this)
    }

    /**
     * The method returns the parking place number
     * @returns {number}
     */
    getParkingSpaceID():number{
        return this.platznummer;
    }

    /**
     * The method takes a {@link Zusatzservice} and pushes it on the service list ({@link Array}) of a parking place
     * @param service   The {@link Zusatzservice} which is pushed on the booked service list of a parking place
     */
    addBockedService(service: Zusatzservice):void{
        this.gebuchteServices.push(service);
    }

}