//Types
interface CustomInputProps {
  title: string;
  value?: string;
  subtitle: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsInput: React.FC<CustomInputProps> = ({
  title,
  subtitle,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full md:w-[500px] lg:w-[600px]">
      <h1 className="font-bold">{title}</h1>
      <p className="text-gray-500 text-sm">{subtitle}</p>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        className="bg-background border-2 border-border rounded-xl p-2 w-full"
      />
    </div>
  );
};
