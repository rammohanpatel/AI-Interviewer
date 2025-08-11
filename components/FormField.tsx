import {Controller, Control,FieldValues,Path} from 'react-hook-form';

import {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input"

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label : string;
    placeholder : string;
    type? : "text" | "password" | "email";
}

const FormField = <T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    type='text'
}: FormFieldProps<T>) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                    <FormLabel className='text-gray-700 dark:text-gray-300 font-medium text-sm'>
                        {label}
                    </FormLabel>
                    <FormControl>
                        <input 
                            type={type}
                            placeholder={placeholder}
                            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 ${
                                fieldState.error 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
                                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                            } hover:border-gray-300 dark:hover:border-gray-500`}
                            {...field}
                        />
                    </FormControl>
                    {fieldState.error && (
                        <FormMessage className="text-red-500 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {fieldState.error.message}
                        </FormMessage>
                    )}
                </FormItem>
            )}
        />
    )
} 

export default FormField;