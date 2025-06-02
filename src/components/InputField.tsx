import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  readOnly?: boolean;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  readOnly = false,
  className = "",
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={`${hidden ? "hidden" : "flex flex-col gap-2"} ${className}`}>
      <label htmlFor={name} className="text-xs text-gray-500">
        {label}
      </label>
      <input
        id={name}
        type={type}
        defaultValue={defaultValue}
        readOnly={readOnly}
        {...register(name)}
        {...inputProps}
        className={`
          ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full
          ${readOnly ? "bg-gray-100 text-gray-600 cursor-not-allowed" : ""}
        `}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
