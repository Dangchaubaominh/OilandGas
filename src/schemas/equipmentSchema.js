import * as Yup from "yup";

export const equipmentSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  serial: Yup.string().required("Serial is required"),
  model: Yup.string().required("Model is required"),
  manufacturer: Yup.string().required("Manufacturer is required"),
  location: Yup.string().required("Location is required"),
});
