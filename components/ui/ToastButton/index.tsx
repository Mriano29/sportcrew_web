//Types
interface ToastButtonProps {
  title: string;
  secondVariant?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ToastButton: React.FC<ToastButtonProps> = ({
  title,
  secondVariant,
  onClick,
}) => {
  const variants = {
    default: "bg-green-500 text-white hover:bg-green-600",
    second: "bg-rose-400 text-white hover:bg-rose-600",
  };

  const buttonStyle = secondVariant ? variants.second : variants.default;

  return (
    <button
      type={"button"}
      onClick={onClick}
      className={`w-full py-2 px-4 rounded-md transition ${buttonStyle} h-10`}
    >
      {title}
    </button>
  );
};
