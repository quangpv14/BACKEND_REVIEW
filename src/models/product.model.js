import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        /* Launch... */
        technology: { type: String, default: "" },
        announced: { type: String, default: "" },
        status: { type: String, default: "" },

        /* Platform... */
        os: { type: String, default: "" },
        protection: { type: String, default: "" },
        cpu: { type: String, default: "" },
        gpu: { type: String, default: "" },
        chipset: { type: String, default: "" },

        /* Body... */
        dimensions: { type: String, default: "" },
        weight: { type: String, default: "" },
        sim: { type: String, default: "" },

        /* Display... */
        display: { type: String, default: "" },
        type: { type: String, default: "" },
        size: { type: String, default: "" },
        multitouch: { type: String, default: "" },
        resolution: { type: String, default: "" },
        build: { type: String, default: "" },

        /* Network... */
        speed: { type: String, default: "" },
        gprs: { type: String, default: "" },
        edge: { type: String, default: "" },
        band2g: { type: String, default: "" },
        band3g: { type: String, default: "" },
        band4g: { type: String, default: "" },

        /* Camera... */
        camera: { type: String, default: "" },
        video: { type: String, default: "" },
        primary: { type: String, default: "" },
        features: { type: String, default: "" },
        secondary: { type: String, default: "" },

        /* Memory... */
        callRecord: { type: String, default: "" },
        cardSlot: { type: String, default: "" },
        phoneBook: { type: String, default: "" },
        internal: { type: String, default: "" },

        /* SOUND... */
        alarm: { type: String, default: "" },
        alertType: { type: String, default: "" },
        jack: { type: String, default: "" },
        audioQuality: { type: String, default: "" },
        loudSpeaker: { type: String, default: "" },

        /* Battery... */
        musicPlay: { type: String, default: "" },
        batteryLife: { type: String, default: "" },
        standBy: { type: String, default: "" },
        talkTime: { type: String, default: "" },

        /* Comms... */
        bluetooth: { type: String, default: "" },
        gps: { type: String, default: "" },
        nfc: { type: String, default: "" },
        wlan: { type: String, default: "" },
        radio: { type: String, default: "" },
        usb: { type: String, default: "" },

        /* Features... */
        performance: { type: String, default: "" },
        keyboard: { type: String, default: "" },
        language: { type: String, default: "" },
        infraredPort: { type: String, default: "" },
        game: { type: String, default: "" },
        messaging: { type: String, default: "" },
        sensor: { type: String, default: "" },

        /* MISC... */
        colors: { type: String, default: "" },
        sareu: { type: String, default: "" },
        sarus: { type: String, default: "" },
        priceGroup: { type: String, default: "" },

        title: {
            type: String,
            required: true,
            unique: true,
        },
        category: { type: String, default: "uncategorized" },
        image: { type: String, default: "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png" },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
