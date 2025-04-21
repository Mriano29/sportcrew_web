//Types
interface CustomInputProps {
  title?: string;
  type: "email" | "password" | "text";
  value?: string;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<CustomInputProps> = ({
  title,
  type,
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium">{title}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-4 py-2 border bg-background border-border rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
        placeholder={placeholder}
      />
    </div>
  );
};
