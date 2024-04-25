/**
 * @swagger
 * /generateOtp:
 *   post:
 *     summary: Generate and send OTP for email verification
 *     description: Endpoint to generate and send OTP for email verification.
 *     tags: [Generate OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *                 description: Email address of the user for verification.
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [success]
 *                 msg:
 *                   type: string
 *                   description: Message describing the outcome of the request.
 *       '400':
 *         description: User already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [fail]
 *                 msg:
 *                   type: string
 *                   description: Error message indicating that the user is already verified.
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [fail]
 *                 msg:
 *                   type: string
 *                   description: Error message indicating a server error.
 */

/**
 * @swagger
 * /generateOtp/mobile:
 *   post:
 *     summary: Generate and send OTP for mobile number verification
 *     description: Endpoint to generate and send OTP for mobile number verification.
 *     tags: [Generate OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_mobile:
 *                 type: string
 *                 description: Mobile number of the user for verification.
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [success]
 *                 msg:
 *                   type: string
 *                   description: Message describing the outcome of the request.
 *       '400':
 *         description: User already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [fail]
 *                 msg:
 *                   type: string
 *                   description: Error message indicating that the user is already verified.
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [fail]
 *                 msg:
 *                   type: string
 *                   description: Error message indicating a server error.
 */
