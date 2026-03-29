import * as yup from "yup";

const instrumentSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  model: yup.string().required("Model is required"),
  manufacturer: yup.string().required("Manufacturer is required"),
  location: yup.string().required("Location is required"),
  status: yup
    .string()
    .oneOf(["operational", "maintenance", "faulty", "out-of-service"])
    .required(),
  measurementRange: yup.string().required("Measurement range is required"),
  accuracy: yup.string().required("Accuracy is required"),
  sampleRate: yup.string().required("Sample rate is required"),
  autoCalibration: yup.boolean(),
});

export default instrumentSchema;
