/**
 * @swagger
 * tags:
 *   name: Register
 */


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register new user by email
 *     description: Endpoint to register a new user using email.
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: integer
 * 
 *     responses:
 *       '200':
 *         description: User registered successfully
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
 *         description: Invalid OTP or OTP expired
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
 *                   description: Message describing the outcome of the request.
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
 *                   description: Error message.
 */


/**
 * @swagger
 * /register/mobile:
 *   post:
 *     summary: Register new user by mobile number
 *     description: Endpoint to register a new user using mobile number.
 *     tags: [Register]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: integer
 * 
 *     responses:
 *       '200':
 *         description: User registered successfully
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
 *         description: Invalid OTP or OTP expired
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
 *                   description: Message describing the outcome of the request.
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
 *                   description: Error message.
 */
