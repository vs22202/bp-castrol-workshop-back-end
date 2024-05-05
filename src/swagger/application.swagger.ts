/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         workshop_name:
 *           type: string
 *         workshop_post_code:
 *           type: string
 *         address:
 *           type: string
 *         state:
 *           type: string
 *         city:
 *           type: string
 *         user_name:
 *           type: string
 *         user_mobile:
 *           type: string
 *         bay_count:
 *           type: integer
 *         services_offered:
 *           type: string
 *         expertise:
 *           type: string
 *         brands:
 *           type: string
 *         consent_process_data:
 *           type: boolean
 *         consent_being_contacted:
 *           type: boolean
 *         consent_receive_info:
 *           type: boolean
 *         file_paths:
 *           type: array
 *           items:
 *             type: string
 *         application_status:
 *           type: string
 *         last_modified_date:
 *           type: string
 *           format: date-time
 *         user_id:
 *           type: integer
 */


/**
 * @swagger
 * /application:
 *   post:
 *     summary: Submit a new application for certification
 *     description: Endpoint to submit a new application for certification.
 *     tags: [Applications]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               workshop_name:
 *                 type: string
 *               workshop_post_code:
 *                 type: string
 *               address:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               user_name:
 *                 type: string
 *               user_mobile:
 *                 type: string
 *               bay_count:
 *                 type: integer
 *               services_offered:
 *                 type: string
 *               expertise:
 *                 type: string
 *               brands:
 *                 type: string
 *               consent_process_data:
 *                 type: boolean
 *               consent_being_contacted:
 *                 type: boolean
 *               consent_receive_info:
 *                 type: boolean
 *               file_paths:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: Application inserted successfully
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
 *       '500':
 *         description: Error inserting application
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
 * /application:
 *   get:
 *     summary: Fetch all records of applications
 *     description: Endpoint to fetch all records of applications.
 *     tags: [Applications]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '200':
 *         description: Records fetched successfully
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
 *                 result:
 *                   type: object
 *                   description: Result object containing fetched records.
 *       '500':
 *         description: Error in fetching data
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
 * /application/edit:
 *   post:
 *     summary: Edit an existing application
 *     description: Endpoint to edit an existing application.
 *     tags: [Applications]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 format: binary
 *             required:
 *               - files
 *     responses:
 *       '200':
 *         description: Application updated successfully
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
 *       '500':
 *         description: Error editing application
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
 * /application/getUserApplication:
 *   get:
 *     summary: Get application details of the authenticated user
 *     description: Endpoint to retrieve application details of the authenticated user.
 *     tags: [Applications]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       '200':
 *         description: Application details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   enum: [success, no records]
 *                 msg:
 *                   type: string
 *                   description: Message describing the outcome of the request.
 *                 result:
 *                   type: object
 *                   description: Application details of the authenticated user.
 *       '500':
 *         description: Error in fetching application details
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
