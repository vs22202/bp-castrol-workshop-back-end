export default function generateOTP(num_of_digits: number = 6) {  

    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < num_of_digits; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP; 
}