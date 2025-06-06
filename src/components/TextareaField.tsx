import { FieldError } from "react-hook-form";

type TextareaFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  readOnly?: boolean;
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
};

const TextareaField = ({
  label,
  register,
  name,
  defaultValue,
  error,
  hidden,
  readOnly,
  inputProps,
}: TextareaFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        {...register(name)}
        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default TextareaField;
