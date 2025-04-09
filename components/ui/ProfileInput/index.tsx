//Types
interface ProfileInputProps {
  value: string;
  isDescription?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({
  value,
  isDescription,
  onChange,
}) => {
  if (isDescription) {
    return (
      <div>
        <textarea
          value={value}
          onChange={onChange}
          className="mt-1 block w-full px-4 py-2 bg-inherit focus:bg-background focus:border-border text-center text-lg font-semibold h-10 resize-none"
        />
      </div>
    );
  }
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="mt-1 block w-full px-4 py-2 bg-inherit focus:bg-background focus:border-border text-center text-2xl font-bold"
      />
    </div>
  );
};
