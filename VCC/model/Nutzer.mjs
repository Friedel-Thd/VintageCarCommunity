import Einlagerer from "./Einlagerer.mjs";
import Lagerhalter from "./Lagerhalter.mjs";
import Werkstatt from "./Werkstatt.mjs";
/**
 * The class Nutzer represents a user in the system, with attributes such as user details, messaging history, and account type.
 * It also provides methods to interact with user data and messaging functionality.
 */
export default class Nutzer {
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
    constructor(userid, email, passwort, vorname, nachname, telefonnummer, stadt, plz, strasse, hnr) {
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
        this.gesendete_nachrichten = new Array();
        this.erhaltene_nachrichten = new Array();
        this.kontotyp = undefined;
        this.kontotypType = undefined;
    }
    static createUser(userid, email, passwort, vornamen, nachname, telefonnummer, stadt, plz, strasse, hnr) {
        return new Nutzer(userid, email, passwort, vornamen, nachname, telefonnummer, stadt, plz, strasse, hnr);
    }
    getuserid() {
        return this.userid;
    }
    getPasswort() {
        return this.passwort;
    }
    getVorname() {
        return this.vorname;
    }
    getNachname() {
        return this.nachname;
    }
    getTelefonnummer() {
        return this.telefonnummer;
    }
    getStadt() {
        return this.stadt;
    }
    getPlz() {
        return this.plz;
    }
    getStrasse() {
        return this.strasse;
    }
    getHnr() {
        return this.hnr;
    }
    getGesendete_nachrichten() {
        return this.gesendete_nachrichten;
    }
    setGesendete_nachricht(message) {
        this.gesendete_nachrichten.push(message);
    }
    getErhaltene_nachrichten() {
        return this.erhaltene_nachrichten;
    }
    getFirstMessage(messages) {
        let message = null;
        for (let i = 0; i < messages.length; i++) {
            message = messages[i];
            if (message.getDate() > messages[i + 1].getDate()) {
                message = messages[i + 1];
                if (i + 1 == messages.length - 1)
                    break;
            }
        }
        return message;
    }
    getFilteredMessages(messages, chatMate, flag) {
        let filteredMessages;
        for (let i = 0; i < messages.length; i++) {
            if (flag) {
                if (messages[i].getEmpfaenger().equals(chatMate)) {
                    filteredMessages.push(messages[i]);
                }
            }
            else {
                if (messages[i].getAbsender().equals(chatMate)) {
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
    getMessageHistory(chatMate) {
        let filteredSendMessages = this.getFilteredMessages(this.gesendete_nachrichten, chatMate, true);
        let filteredReceivedMessages = this.getFilteredMessages(this.erhaltene_nachrichten, chatMate, false);
        let chatHistory;
        if (this.getFirstMessage(filteredSendMessages).getDate() < this.getFirstMessage(filteredReceivedMessages).getDate()) {
        }
        else {
        }
        return chatHistory;
    }
    /**
     * The method sets an incoming message to the user's received messages.
     * @param message The Nutzernachricht object representing the received message
     */
    setErhaltene_nachricht(message) {
        this.erhaltene_nachrichten.push(message);
    }
    getKontotyp() {
        return this.kontotyp;
    }
    getEmail() {
        return this.email;
    }
    setKontotyp(kontoTyp) {
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
    equals(other) {
        if (other == null)
            return false;
        if (other == this)
            return true;
        if (!(other instanceof Nutzer))
            return false;
        let that = other;
        return this.userid == that.getuserid() && this.vorname == that.getVorname() && this.nachname == that.getNachname();
    }
    /**
     * The static method creates a Nutzer instance from JSON data.
     * @param jsonData The JSON data representing a Nutzer
     * @returns {Nutzer} A new Nutzer instance created from the JSON data
     */
    static fromJson(jsonData) {
        const user = new Nutzer(jsonData.userid, jsonData.email, jsonData.passwort, jsonData.vorname, jsonData.nachname, jsonData.telefonnummer, jsonData.stadt, jsonData.plz, jsonData.strasse, jsonData.hnr);
        return user;
    }
}
//# sourceMappingURL=Nutzer.mjs.map