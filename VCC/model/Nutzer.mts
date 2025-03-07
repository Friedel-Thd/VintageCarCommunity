import Nutzernachricht from "./Nutzernachricht.mjs";
import Kontotyp from "./Kontotyp.mjs";
import Einlagerer from "./Einlagerer.mjs";
import Lagerhalter from "./Lagerhalter.mjs";
import Werkstatt from "./Werkstatt.mjs";

/**
 * The class Nutzer represents a user in the system, with attributes such as user details, messaging history, and account type.
 * It also provides methods to interact with user data and messaging functionality.
 */
export default class Nutzer {
    private userid: number;
    private email: string;
    private passwort: string;
    private vorname: string;
    private nachname: string;
    private telefonnummer: string;
    private stadt: string;
    private plz: string;
    private strasse: string;
    private hnr: string;
    private gesendete_nachrichten: Array<Nutzernachricht>;
    private erhaltene_nachrichten: Array<Nutzernachricht>;
    private kontotyp: Kontotyp | undefined;
    private kontotypType: string | undefined;

    /**
     * The constructor of the class, which initializes the Nutzer object with the provided parameters.
     * @param userid The user ID
     * @param email The user's email address
     * @param passwort The user's password
     * @param vorname The user's first name
     * @param nachname The user's last name
     * @param telefonnummer The user's phone number
     * @param stadt The user's city
     * @param plz The user's postal code
     * @param strasse The user's street
     * @param hnr The user's house number
     * The constructor is set to @private.
     */
    private constructor(userid: number, email: string, passwort: string, vorname: string, nachname: string, telefonnummer: string,
                stadt: string, plz: string, strasse: string, hnr: string) {
        this.userid = userid;
        this.email = email;
        this.passwort = passwort;
        this.vorname = vorname;
        this.nachname = nachname;
        this.telefonnummer = telefonnummer;
        this.stadt = stadt;
        this.plz = plz;
        this.strasse = strasse;
        this.hnr = hnr;
        this.gesendete_nachrichten = new Array<Nutzernachricht>();
        this.erhaltene_nachrichten = new Array<Nutzernachricht>();
        this.kontotyp = undefined;
        this.kontotypType = undefined;
    }

    public static createUser(userid: number, email: string, passwort: string, vornamen: string, nachname: string, telefonnummer: string,
               stadt: string, plz: string, strasse: string, hnr: string):Nutzer{
        return new Nutzer(userid, email, passwort, vornamen, nachname, telefonnummer, stadt, plz, strasse, hnr);
    }

    getuserid(): number {
        return this.userid;
    }

    getPasswort(): string {
        return this.passwort;
    }

    getVorname(): string {
        return this.vorname;
    }

    getNachname(): string {
        return this.nachname;
    }

    getTelefonnummer(): string {
        return this.telefonnummer;
    }

    getStadt(): string {
        return this.stadt;
    }

    getPlz(): string {
        return this.plz;
    }

    getStrasse(): string {
        return this.strasse;
    }

    getHnr(): string {
        return this.hnr;
    }

    getGesendete_nachrichten(): Array<Nutzernachricht> {
        return this.gesendete_nachrichten;
    }

    setGesendete_nachricht(message: Nutzernachricht):void{
        this.gesendete_nachrichten.push(message);
    }

    getErhaltene_nachrichten(): Array<Nutzernachricht> {
        return this.erhaltene_nachrichten;
    }

    private getFirstMessage(messages:Array<Nutzernachricht>):Nutzernachricht{
        let message:Nutzernachricht=null;
        for (let i=0; i<messages.length; i++){
            message=messages[i];
            if (message.getDate()>messages[i+1].getDate()){
                message=messages[i+1];
                if (i+1==messages.length-1)
                    break;
            }
        }
        return message;
    }

    private getFilteredMessages(messages:Array<Nutzernachricht>, chatMate:Nutzer, flag:boolean):Array<Nutzernachricht>{
        let filteredMessages:Array<Nutzernachricht>;
        for (let i=0; i<messages.length; i++){
            if (flag)
            {
                if (messages[i].getEmpfaenger().equals(chatMate))
                {
                    filteredMessages.push(messages[i]);
                }
            }
            else
            {
                if (messages[i].getAbsender().equals(chatMate))
                {
                    filteredMessages.push(messages[i]);
                }
            }
        }
        return filteredMessages;
    }

    /**
     * The method returns the user's messaging history with a specific chat mate.
     * @param chatMate The other user involved in the conversation
     * @returns {Array<Nutzernachricht>} An array of Nutzernachricht representing the chat history
     */
    getMessageHistory(chatMate: Nutzer):Array<Nutzernachricht>{
        let filteredSendMessages:Array<Nutzernachricht>=this.getFilteredMessages(this.gesendete_nachrichten, chatMate, true);
        let filteredReceivedMessages:Array<Nutzernachricht>=this.getFilteredMessages(this.erhaltene_nachrichten, chatMate, false);
        let chatHistory:Array<Nutzernachricht>;

        if (this.getFirstMessage(filteredSendMessages).getDate()<this.getFirstMessage(filteredReceivedMessages).getDate())
        {

        }
        else
        {

        }
        return chatHistory;
    }

    /**
     * The method sets an incoming message to the user's received messages.
     * @param message The Nutzernachricht object representing the received message
     */
    setErhaltene_nachricht(message: Nutzernachricht):void{
        this.erhaltene_nachrichten.push(message);
    }

    getKontotyp(): Kontotyp | undefined {
        return this.kontotyp;
    }

    getEmail(): string {
        return this.email;
    }

    setKontotyp(kontoTyp: Kontotyp) {
        this.kontotyp = kontoTyp;
        if (kontoTyp instanceof Einlagerer) {
            this.kontotypType = "Einlagerer";
        }
        else if (kontoTyp instanceof Lagerhalter) {
            this.kontotypType = "Lagerhalter";
        }
        else if (kontoTyp instanceof Werkstatt) {
            this.kontotypType = "Werkstatt";
        }
    }

    /**
     * The method checks if two Nutzer instances are equal.
     * @param other The other Nutzer instance for comparison
     * @returns {boolean} True if the Nutzer instances are equal, otherwise false
     */
    equals(other:Nutzer):boolean{
        if (other==null) return false;
        if(other==this) return true;
        if (!(other instanceof Nutzer)) return false;
        let that:Nutzer=other as Nutzer;
        return this.userid==that.getuserid() && this.vorname==that.getVorname()&&this.nachname==that.getNachname();
    }

    /**
     * The static method creates a Nutzer instance from JSON data.
     * @param jsonData The JSON data representing a Nutzer
     * @returns {Nutzer} A new Nutzer instance created from the JSON data
     */
    static fromJson(jsonData): Nutzer {
        const user = new Nutzer(
            jsonData.userid,
            jsonData.email,
            jsonData.passwort,
            jsonData.vorname,
            jsonData.nachname,
            jsonData.telefonnummer,
            jsonData.stadt,
            jsonData.plz,
            jsonData.strasse,
            jsonData.hnr
        );
        return user;
    }
}