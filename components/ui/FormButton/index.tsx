//Types
interface CustomButtonProps {
  title: string;
  type: "submit" | "reset" | "button";
  secondVariant?: boolean;
  thirdVariant?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export const FormButton: React.FC<CustomButtonProps> = ({
  title,
  type,
  secondVariant,
  thirdVariant,
  onClick,
  disabled,
}) => {
  const variants = {
    default: "bg-cyan-500 text-white hover:bg-cyan-600",
    second: "bg-rose-400 text-white hover:bg-rose-600",
    third: "bg-green-500 text-white hover:bg-green-600",
  };

  const buttonStyle = thirdVariant
    ? variants.third
    : secondVariant
      ? variants.second
      : variants.default;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-2 px-4 rounded-md transition ${buttonStyle}`}
      disabled={disabled}
    >
      {title}
    </button>
  );
};
