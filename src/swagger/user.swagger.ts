/**
 * @swagger
 * tags:
 *   name: User
 */

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get user details
 *     description: Endpoint to retrieve user details.
 *     tags: [User]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     user_email:
 *                       type: string
 *                     user_mobile:
 *                       type: string
 *                     verified:
 *                       type: string
 *       '201':
 *         description: User data was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [error]
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
 *         required: true
 *         schema:
 *           type: string  
 */

/**
 * @swagger
 * /user/changepassword:
 *   post:
 *     summary: Change user password
 *     description: Endpoint to change user password.
 *     tags: [User]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 * 
 *     responses:
 *       '200':
 *         description: Password changed successfully
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
 *       '201':
 *         description: User data was not found or old password does not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [error]
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
 *         required: true
 *         schema:
 *           type: string   
 */

/**
 * @swagger
 * /user/generateResetOtp:
 *   post:
 *     summary: Generate OTP for password reset
 *     description: Endpoint to generate OTP for password reset.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *               user_mobile:
 *                 type: string
 * 
 *     responses:
 *       '200':
 *         description: Reset OTP sent successfully
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
 *         description: Email or mobile number does not exist, or invalid request
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
 * /user/resetPassword:
 *   post:
 *     summary: Reset user password
 *     description: Endpoint to reset user password using OTP.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *               user_mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: integer
 * 
 *     responses:
 *       '200':
 *         description: Password reset successfully
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
 *         description: OTP expired or invalid
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
 *         description: Server error or invalid request
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
