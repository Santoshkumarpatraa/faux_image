const { Canvas, loadImage } = require("canvas-constructor/napi-rs");
const Joi = require("joi");

/**
 * FauxImageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /*** 
   ** Image Generator
   * API Endpoint :   /:dimensions
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.

     The canvas-constructor/napi-rs library is designed to provide a chainable interface for creating and manipulating images using the HTML5 Canvas API. Here are some of the chaining methods that you can use with the Canvas instance from this library:
     setColor(color: string): Canvas - Sets the current color for drawing operations.
     setTextFont(font: string): Canvas - Sets the current font for text rendering.
     setTextAlign(align: CanvasTextAlign): Canvas - Sets the alignment for text rendering.
     printText(text: string, x: number, y: number): Canvas - Prints the specified text at the given coordinates.
     drawImage(image: Image, x: number, y: number, width: number, height: number): Canvas - Draws an image on the canvas.
     printImage(image: Image, x: number, y: number, width: number, height: number): Canvas - Prints an image on the canvas.
     setShadow(color: string, blur: number): Canvas - Sets a shadow for subsequent drawing operations.
     clearRect(x: number, y: number, width: number, height: number): Canvas - Clears a rectangular area on the canvas.
     rect(x: number, y: number, width: number, height: number): Canvas - Creates a rectangle path.
     fillRect(x: number, y: number, width: number, height: number): Canvas - Fills a rectangle with the current color.
     line(x1: number, y1: number, x2: number, y2: number): Canvas - Creates a line path.
     stroke(): Canvas - Applies a stroke to the current path.
     fill(): Canvas - Fills the current path with the current color.
     png(): Buffer - Returns a PNG representation of the canvas as a Buffer.
     */

  imageGenerator: async (req, res) => {
    console.info(
      "====================== IMAGE GENERATOR : IMAGE REQUEST ==============================\n"
    );
    console.info(
      "HTTP Method - " + req.method + "  |||||||||||  URL - " + req.url + "\n"
    );
    console.info("REQ Query :", req.query);
    console.info("REQ Param :", req.params);

    let request = {
      dimensions: req.params.dimensions,
      bgColor: req.query.bgcolor,
      text: req.query.text,
      fontName: req.query.fontName,
      fontSize: req.query.fontSize,
      fontColor: req.query.fontColor,
      imageType: req.query.imageType,
      imageUrl: req.query.imageUrl,
      downlaod: req.query.d,
    };

    const schema = Joi.object().keys({
      dimensions: Joi.string(),
      bgColor: Joi.string().allow(""),
      text: Joi.string().allow(""),
      fontName: Joi.string().allow(""),
      fontSize: Joi.number(),
      fontColor: Joi.string().allow(""),
      imageType: Joi.string().valid("png", "jpeg", "webp"),
      imageUrl: Joi.string().allow(""),
      downlaod: Joi.string().allow(""),
    });

    const validateResult = schema.validate(request);

    if (validateResult.error) {
      return ResponseService.jsonResponse(
        res,
        ConstantService.responseCode.BAD_REQUEST,
        {
          message: validateResult.error.message,
        }
      );
    }

    //const googleFontUrl =
    //   "https://fonts.googleapis.com/css2?family=" + "Handjet" + "&display=swap";
    //Load and register the Google Font
    //await Canvas.registerFont(googleFontUrl, { family: 'Handjet' });
    //Canvas.registerFont(resolve(join(__dirname, './path/to/font/Discord.ttf')), 'Discord');
    let width = 0;
    let height = 0;
    let dimensions = request.dimensions.split("x");
    request.dimensions = request.dimensions.toUpperCase();

    if (
      dimensions.length === 2 &&
      Number.isInteger(parseInt(dimensions[0])) &&
      Number.isInteger(parseInt(dimensions[1]))
    ) {
      width = parseInt(dimensions[0]);
      height = parseInt(dimensions[1]);
    } else if (ConstantService.resolution_key[request.dimensions]) {
      let splDimensions = ConstantService.resolution_key[request.dimensions];
      splDimensions = splDimensions.split("x");
      width = parseInt(splDimensions[0]);
      height = parseInt(splDimensions[1]);
    } else {
      return res.render("404", { url: req.url });
    }

    let imageUrl =
      "https://mcusercontent.com/c1afbaede1004bd31b4f241b5/images/d0d72998-b73a-03df-ea1b-fa8ea3246464.png";
    let regex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    let bgColor = "#FFE082";
    let fontColor = "#b39d5b";
    let fontName = "Helvetica";
    let imageType = "png";
    let text =
      typeof request.text === "string" ? request.text : `${width}x${height}`;
    let fontSize = request.fontSize ? parseInt(request.fontSize) : width / 5;

    if (request.imageUrl) {
      imageUrl = request.imageUrl;
    }

    if (request.fontColor) {
      request.fontColor = `#${request.fontColor}`;
      if (regex.test(request.fontColor)) {
        fontColor = request.fontColor;
      }
    }

    if (request.bgColor) {
      request.bgColor = `#${request.bgColor}`;
      if (regex.test(request.bgColor)) {
        bgColor = request.bgColor;
      }
    }

    if (request.fontName) {
      fontName = request.fontName;
    }

    const image = await loadImage(imageUrl);

    // Create a new Canvas instance
    const imageGenerated = new Canvas(width, height)
      .printImage(image, 0, 0, width, height)
      .setColor(`${bgColor}`)
      .printRectangle(0, 0, width, height)
      .setColor(`${fontColor}`)
      .setTextFont(`${fontSize}px ${fontName}`)
      .setTextAlign("center")
      .printText(text, width / 2, height / 2 + fontSize / 4)
      .png();

    if (typeof request.downlaod === "string") {
      const filename = `faux_image_${Date.now()}.${imageType}`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
    }

    //res.set({ "Content-Type": "image/png" });
    res.header("Content-Type", `image/${imageType}`);
    res.send(imageGenerated);
  },

  /***
   ** Image Generator
   * API Endpoint :   /
   * API Method   :   GET
   *
   * @param   {Object}        req          Request Object From API Request.
   * @param   {Object}        res          Response Object For API Request.
   * @returns {Promise<*>}    JSONResponse With success code 200 and  information or relevant error code with message.
   */

  imageWeb: async (req, res) => {
    return res.render("imageWeb", { url: "www.santosh.com" });
  },
};
