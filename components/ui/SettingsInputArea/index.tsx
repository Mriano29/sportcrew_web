//Types
interface CustomInputProps {
  title: string;
  value?: string;
  subtitle: string;
  isArea?: boolean;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const SettingsInputArea: React.FC<CustomInputProps> = ({
  title,
  subtitle,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full md:w-[500px] lg:w-[600px]">
      <h1 className="font-bold">{title}</h1>
      <p className="text-gray-500 text-sm">{subtitle}</p>
      <textarea
        value={value || ""}
        onChange={onChange}
        className="bg-background border-2 border-border rounded-xl p-2 w-full h-[150px] resize-none"
      />
    </div>
  );
};
