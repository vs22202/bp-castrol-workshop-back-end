/**
 * @swagger
 * tags:
 *   name: Castrol Admin
 */

/**
 * @swagger
 * /castrol_admin:
 *   get:
 *     summary: Get HTML content for Castrol admin
 *     description: Endpoint to retrieve HTML content for Castrol admin using authentication token.
 *     tags: [Castrol Admin]
 *     parameters:
 *       - in: query
 *         name: auth_token
 *         required: true
 *         description: Authentication token for accessing Castrol admin functionality.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: HTML content retrieved successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: '<html><body><h1>Welcome to Castrol Admin</h1></body></html>'
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
