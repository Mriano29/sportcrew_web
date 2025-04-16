//Types
interface CustomInputProps {
  title: string;
  type: "submit" | "reset" | "button";
  onClick?: () => void;
}

export const SettingsButton: React.FC<CustomInputProps> = ({
  title,
  type,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className="bg-accent hover:bg-accent-foreground border-2 border-border py-2 px-4 text-white rounded-2xl shadow-lg transition"
    >
      {title}
    </button>
  );
};
