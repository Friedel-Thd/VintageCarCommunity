/**
 * The class Nutzernachricht represents a user message exchanged between two instances of {@link Nutzer}.
 * It includes information such as the sender, recipient, date, and message content.
 */
export default class Nutzernachricht {
    /**
     * The constructor of the class, which initializes the Nutzernachricht object with the provided parameters:
     * @param absender   The sender of the message, an instance of {@link Nutzer}
     * @param empfaenger The recipient of the message, an instance of {@link Nutzer}
     * @param inhalt     The content of the message
     * The constructor is set to @private.
     */
    constructor(absender, empfaenger, inhalt) {
        this.absender = absender;
        this.empfaenger = empfaenger;
        this.inhalt = inhalt;
        this.datum = new Date(); // Automatically set the current date and time
    }
    /**
     * The method creates and returns an instance of Nutzernachricht.
     * @param absender   The sender of the message, an instance of {@link Nutzer}
     * @param empfaenger The recipient of the message, an instance of {@link Nutzer}
     * @param inhalt     The content of the message
     * @returns {Nutzernachricht} A new instance of Nutzernachricht
     * The access rights are set to @public and the method is static.
     */
    static createMessage(absender, empfaenger, inhalt) {
        return new Nutzernachricht(absender, empfaenger, inhalt);
    }
    /**
     * The method returns the sender of the message.
     * @returns {Nutzer} The sender of the message, an instance of {@link Nutzer}
     */
    getAbsender() {
        return this.absender;
    }
    /**
     * The method returns the recipient of the message.
     * @returns {Nutzer} The recipient of the message, an instance of {@link Nutzer}
     */
    getEmpfaenger() {
        return this.empfaenger;
    }
    /**
     * The method returns the date and time when the message was created.
     * @returns {Date} The date and time of the message creation
     */
    getDate() {
        return this.datum;
    }
}
//# sourceMappingURL=Nutzernachricht.mjs.map