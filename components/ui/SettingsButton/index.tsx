//Types
interface CustomInputProps {
  title: string;
  type: "submit" | "reset" | "button";
  onClick?: () => void;
  isLogout?: boolean;
}

export const SettingsButton: React.FC<CustomInputProps> = ({
  title,
  type,
  onClick,
  isLogout
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${
        isLogout
          ? "bg-red-500 hover:bg-red-600 border-white"
          : "bg-accent hover:bg-accent-foreground border-border"
      } border-2 py-2 px-4 text-white rounded-2xl shadow-lg transition`}
    >
      {title}
    </button>
  );
};
