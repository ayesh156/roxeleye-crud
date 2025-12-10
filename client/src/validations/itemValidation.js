import * as yup from 'yup';

export const itemSchema = yup.object().shape({
    name: yup
        .string()
        .trim()
        .required('Item name is required')
        .min(2, 'Item name must be at least 2 characters')
        .max(100, 'Item name cannot exceed 100 characters'),
    
    description: yup
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .nullable(),
    
    price: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === '' ? 0 : value;
        })
        .min(0, 'Price must be a positive number')
        .typeError('Price must be a valid number'),
    
    quantity: yup
        .number()
        .transform((value, originalValue) => {
            return originalValue === '' ? 0 : value;
        })
        .integer('Quantity must be a whole number')
        .min(0, 'Quantity must be a non-negative number')
        .typeError('Quantity must be a valid number'),
});

// Helper function to validate form data
export const validateItem = async (data) => {
    try {
        const validData = await itemSchema.validate(data, { abortEarly: false });
        return { isValid: true, data: validData, errors: {} };
    } catch (err) {
        const errors = {};
        if (err.inner) {
            err.inner.forEach((error) => {
                if (!errors[error.path]) {
                    errors[error.path] = error.message;
                }
            });
        }
        return { isValid: false, data: null, errors };
    }
};

// Helper function to validate a single field
export const validateField = async (field, value) => {
    try {
        await itemSchema.validateAt(field, { [field]: value });
        return null;
    } catch (err) {
        return err.message;
    }
};
