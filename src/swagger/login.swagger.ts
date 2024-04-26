/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         user_email:
 *           type: string
 *         user_mobile:
 *           type: string
 *         password:
 *           type: string
 *         verified:
 *           type: boolean
 * 
 */


/**
 * @swagger
 * tags:
 *   name: Login
 */


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Validate user login details by email
 *     description: Endpoint to validate user login details using email.
 *     tags: [Login]
 *     security:
 *       - JWTAuth: []
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
 *             
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 auth_token:
 *                   type: string
 *                   description: JWT token for authentication
 *       '400':
 *         description: Invalid email or password
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
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token obtained after user authentication
 *         required: false
 *         schema:
 *           type: string
 */


/**
 * @swagger
 * /login/mobile:
 *   post:
 *     summary: Validate user login details by mobile number
 *     description: Endpoint to validate user login details using mobile number.
 *     tags: [Login]
 *     security:
 *       - JWTAuth: []
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
 * 
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 auth_token:
 *                   type: string
 *                   description: JWT token for authentication
 *       '400':
 *         description: Invalid mobile number or password
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
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: JWT token obtained after user authentication
 *         required: false
 *         schema:
 *           type: string 
 */