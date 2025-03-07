import Lagerhalter from "./Lagerhalter.mjs";

/**
 * The class Zusatzservice represents services which are provided by an instance of {@link Lagerhalter}.
 * They belong to instances of {@link Stellplatz} and can be booked by each instance of {@link Einlagerer}
 */

export default class Zusatzservice {
    private lagerhalter: Lagerhalter;
    private name: string;
    private beschreibung: string;
    private ID: number;
    private preis: number;

    /**
     * The constructor of the class, which takes the parameters:
     * @param lagerhalter   An instance of the class {@link Lagerhalter} which is the provider of services
     * @param name  The name of the service
     * @param beschreibung  The description of the service
     * @param id    The service id
     * @param preis The service price
     * The constructor access rights are set to @private
     */
    private constructor(lagerhalter: Lagerhalter, name: string, beschreibung: string, id:number, preis:number) {
        this.lagerhalter=lagerhalter;
        this.name=name;
        this.beschreibung=beschreibung;
        this.ID=id;
        this.preis=preis;
    }

    /**
     *The method creates and returns an instance of Zusatzservice and takes the parameters:
     * @param lagerhalter   An instance of the class {@link Lagerhalter} which is the provider of services
     * @param name  The name of the service
     * @param beschreibung  The description of the service
     * @param id    The service id
     * @param preis The service price
     * The access rights are set to @public and the method is static
     */
    public static createZusatzService(lagerhalter: Lagerhalter, name: string, beschreibung: string, id:number, preis:number):Zusatzservice{
        return new Zusatzservice(lagerhalter, name, beschreibung, id, preis);
    }

    /**
     *The method returns a formatted string which contains every
     * information which is needed to represent a service
     * @returns {string}
     */
    getFormattedInfo():string{
        return "Service ID: "+this.ID+"\n"+"Name: "+this.name+"\n"+"Preis: "+this.preis+"\n"+"Beschreibung: \n"+this.beschreibung+"\n";
    }

    /**
     *The method returns the service id
     *@returns {number}
     */
    getServiceID(): number{
        return this.ID;
    }
}