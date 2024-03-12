import axios from 'axios'

async function sendOTPWhatsapp(recipient: string,otp:string) {
    const apiUrl = `https://graph.facebook.com/v19.0/${process.env.META_PHONE_ID}/messages`;

    try {
        const response = await axios(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
            },
            data: JSON.stringify({
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": `${recipient}`,
                "type": "template",
                "template": {
                    "name": "otp_template",
                    "language": {
                        "code": "en_GB"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": `${otp}`
                                }
                            ]
                        }
                    ]
                }
            }),
        });
        const result = response.data;
        if (result.messages[0].message_status && result.messages[0].message_status == "accepted") {
            console.log("Message sent successfully. The message id is:", result.messages[0].id);
        }
        else {
            console.log('Message failed to send');
        }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}
export default sendOTPWhatsapp;

