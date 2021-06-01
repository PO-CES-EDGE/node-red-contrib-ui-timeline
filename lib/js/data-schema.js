const Joi = require('@hapi/joi');

/**
 * Sample
 data: {
          labels: ["1", "2", "3"],
          datasets: [
            {
              data: [
                [
                  "2018-01-22T16:00:00.000Z",
                  "2018-01-22T16:30:44.626Z",
                  "1",
                ],
              ],
            },
            {
              data: [
                ["2018-01-22T16:30:44.626Z", "2018-01-22T17:00:44.626Z", "2"],
              ],

            },
			{
              data: [
                ["2018-01-22T17:00:44.626Z", "2018-01-22T17:30:44.626Z", "3"],
              ],
            },
          ],
          */


module.exports.stepSchema = stepSchema = Joi.array().items(Joi.string()).min(3).max(3);

module.exports.dataSetSchema = dataSetSchema = Joi.object({
    data: Joi.array().items(stepSchema).required().single(),
});

module.exports.data = Joi.object({
  labels: Joi.array().items(Joi.string()).required(),
  datasets: Joi.array().items(dataSetSchema).required()
});


//
// module.exports.startCapture = Joi.object({
//   sessionId: Joi.string().required(),
//   resolution: Joi.string().required(),
//   networkUploadSpeed: Joi.number().integer().allow(null).required(),
//   networkDownloadSpeed: Joi.number().integer().allow(null).required(),
//   networkLatencySpeed: Joi.number().integer().allow(null).required(),
//   sessionIds: Joi.string().required(),
//   docSide: Joi.string().valid(...Object.values(DOC_SIDE)),
//   docType: Joi.string(),
//   countryCode: Joi.string().allow('', null).optional(),
//   firstSessionId: Joi.string().required(),
//   recordLabel: Joi.string().alphanum().min(1).max(64).allow(null).required(),
//   mediaLabel: Joi.string().required()
// });
//
// const sideSchema = {
//   id: Joi.string(),
//   code: Joi.string().valid(...Object.values(DOC_SIDE)),
//   image: Joi.string(),
//   diagnostic: Joi.object(),
//   corners: Joi.array(),
//   captureFeatures: Joi.array().items({
//     type: Joi.string().valid(...Object.values(DOC_SIDE_RULE)),
//     result: Joi.object()
//   })
//
// };
//
// const sidesSchema = Joi.array().items(sideSchema);
//
// const doctypeSchema = Joi.object({
//   sides: sidesSchema,
//   format: Joi.string().valid(...Object.values(DOC_FORMAT)),
//   type: Joi.string().valid(...Object.values(DOC_TYPE))
// });
// const tlsSchema = Joi.object({
//   key: Joi.string().optional(),
//   cert: Joi.string().optional(),
//   ca: Joi.string().optional()
//
// });
//
// module.exports.documentSchema = doctypeSchema;
//
// const clusterNoneSchema = Joi.object({
//   host: Joi.string().required(),
//   port: Joi.number().min(1).max(99999).required(),
//   password: Joi.string(),
//   tls: tlsSchema
// });
//
// module.exports.clusterSchema = Joi.array().items(clusterNoneSchema).min(1).required();
